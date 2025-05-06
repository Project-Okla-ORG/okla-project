from flask import Flask, request, jsonify
import boto3
import os
import json
import logging
from werkzeug.utils import secure_filename
import tempfile
import uuid
from botocore.exceptions import ClientError
import PyPDF2
from PIL import Image
import io

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AWS clients
def get_aws_client(service_name):
    return boto3.client(
        service_name,
        region_name=os.environ.get('AWS_REGION', 'us-east-1')
    )

# Get secrets from AWS Secrets Manager
def get_secret(secret_name):
    client = get_aws_client('secretsmanager')
    try:
        response = client.get_secret_value(SecretId=secret_name)
        if 'SecretString' in response:
            return json.loads(response['SecretString'])
    except ClientError as e:
        logger.error(f"Error retrieving secret: {e}")
        raise e

# Initialize S3 client
s3_client = get_aws_client('s3')
bucket_name = os.environ.get('S3_BUCKET_NAME')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route('/api/documents/validate', methods=['POST'])
def validate_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    file.save(temp_file.name)
    temp_file.close()
    
    validation_result = {
        "valid": True,
        "filename": filename,
        "size": os.path.getsize(temp_file.name),
        "type": file.content_type,
        "metadata": {}
    }
    
    try:
        # Validate based on file type
        if file_extension == 'pdf':
            validation_result["metadata"] = validate_pdf(temp_file.name)
        elif file_extension in ['jpg', 'jpeg', 'png']:
            validation_result["metadata"] = validate_image(temp_file.name)
        else:
            validation_result["valid"] = False
            validation_result["error"] = "Unsupported file type"
    except Exception as e:
        logger.error(f"Error validating file: {e}")
        validation_result["valid"] = False
        validation_result["error"] = str(e)
    finally:
        # Clean up the temporary file
        os.unlink(temp_file.name)
    
    return jsonify(validation_result)

def validate_pdf(file_path):
    metadata = {}
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            metadata["page_count"] = len(pdf_reader.pages)
            metadata["encrypted"] = pdf_reader.is_encrypted
            
            # Extract text from first page for preview
            if len(pdf_reader.pages) > 0:
                first_page = pdf_reader.pages[0]
                text = first_page.extract_text()
                metadata["preview"] = text[:200] + "..." if len(text) > 200 else text
    except Exception as e:
        raise Exception(f"Invalid PDF file: {str(e)}")
    
    return metadata

def validate_image(file_path):
    metadata = {}
    try:
        with Image.open(file_path) as img:
            metadata["width"] = img.width
            metadata["height"] = img.height
            metadata["format"] = img.format
            metadata["mode"] = img.mode
    except Exception as e:
        raise Exception(f"Invalid image file: {str(e)}")
    
    return metadata

@app.route('/api/documents/analyze', methods=['POST'])
def analyze_document():
    data = request.json
    if not data or 's3_key' not in data:
        return jsonify({"error": "S3 key is required"}), 400
    
    s3_key = data['s3_key']
    
    try:
        # Create a temporary file to download the S3 object
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            s3_client.download_file(bucket_name, s3_key, temp_file.name)
            
            # Determine file type from key
            file_extension = s3_key.rsplit('.', 1)[1].lower() if '.' in s3_key else ''
            
            analysis_result = {
                "s3_key": s3_key,
                "analysis": {}
            }
            
            # Analyze based on file type
            if file_extension == 'pdf':
                analysis_result["analysis"] = analyze_pdf(temp_file.name)
            elif file_extension in ['jpg', 'jpeg', 'png']:
                analysis_result["analysis"] = analyze_image(temp_file.name)
            else:
                analysis_result["analysis"]["error"] = "Unsupported file type for analysis"
        
        # Clean up the temporary file
        os.unlink(temp_file.name)
        
        return jsonify(analysis_result)
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        return jsonify({"error": str(e)}), 500

def analyze_pdf(file_path):
    analysis = {
        "content_summary": "",
        "page_count": 0
    }
    
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            analysis["page_count"] = len(pdf_reader.pages)
            
            # Extract text from all pages
            full_text = ""
            for page_num in range(min(5, len(pdf_reader.pages))):  # Limit to first 5 pages
                page = pdf_reader.pages[page_num]
                full_text += page.extract_text() + "\n"
            
            # Simple content summary (first 500 chars)
            analysis["content_summary"] = full_text[:500] + "..." if len(full_text) > 500 else full_text
    except Exception as e:
        analysis["error"] = f"Error analyzing PDF: {str(e)}"
    
    return analysis

def analyze_image(file_path):
    analysis = {
        "dimensions": "",
        "format": "",
        "size_kb": 0
    }
    
    try:
        with Image.open(file_path) as img:
            analysis["dimensions"] = f"{img.width}x{img.height}"
            analysis["format"] = img.format
            analysis["size_kb"] = os.path.getsize(file_path) / 1024
    except Exception as e:
        analysis["error"] = f"Error analyzing image: {str(e)}"
    
    return analysis

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))

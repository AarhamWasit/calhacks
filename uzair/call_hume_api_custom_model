import requests
import base64

def call_hume_api(image_path):
    # Load image and convert to base64
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    
    # Prepare the data for the API call
    data = {
        'image': encoded_string
    }
    
    # Define the HUME API endpoint and your custom model endpoint
    url = "https://api.hume.ai/v1/models/9915e721-bd93-429d-ae45-27098417283d/versions/e4ac03fd-185d-40ae-98e9-b2c4fc00da42:predict"
    
    # Define the headers for the API call (if necessary, e.g., for authentication)
    headers = {
        'Authorization': 'Bearer jxYLjpcsWArNEAoTuOjdRU0QwKkDzDo0Ry047WrXYSGNlVo3',
        'Content-Type': 'application/json',
    }
    
    # Make the API call
    response = requests.post(url, json=data, headers=headers)
    
    # Check for a valid response
    if response.status_code == 200:
        # Parse the response (assuming JSON response)
        response_data = response.json()
        return response_data
    else:
        print(f"Failed to call API. Status code: {response.status_code}")
        print(response.text)  # Print error message if any

# Example usage:
result = call_hume_api('path_to_your_image.jpg')
print(result)

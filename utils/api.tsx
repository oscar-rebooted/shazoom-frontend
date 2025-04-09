const API_BASE_URL = "https://nxd6qgldf2.execute-api.eu-west-2.amazonaws.com/prod"

export const warmupShazoomLambda = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/find-song`, {
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    console.error('Error warming up Lambda:', error);
    throw error;
  }
};

export const getPresignedUrl = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload-url`, {
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw error;
  }
};

export const findSong = async (fileKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/find-song`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "fileKey": fileKey }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error identifying song:', error);
    throw error;
  }
};
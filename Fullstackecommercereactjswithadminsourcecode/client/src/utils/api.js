import axios from "axios";


const token=localStorage.getItem("token");

const params={
    headers: {
        'Authorization': `Bearer ${token}`, // Include your API key in the Authorization header
        'Content-Type': 'application/json', // Adjust the content type as needed
      },

} 

export const fetchDataFromApi = async (url) => {
    try {
        const { data } = await axios.get(process.env.REACT_APP_API_URL + url, params)
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * Gửi POST, tự động phát hiện JSON hay FormData
 * @param {string} url 
 * @param {object|FormData} payload
 */
export const postData2 = async (url, payload) => {
  try {
    // kiểm tra xem payload có phải FormData không
    const isForm = payload instanceof FormData;

    const response = await fetch(process.env.REACT_APP_API_URL + url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // chỉ set Content-Type khi payload là JSON
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      },
      // body: nếu FormData thì truyền nguyên, JSON thì phải stringify
      body: isForm ? payload : JSON.stringify(payload),
    });

    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error('Error in postData:', error);
    throw error;
  }
};

export const postData3 = async (url, formData) => {
    try {
        const response = await fetch(process.env.REACT_APP_API_URL + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
           
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            
            //console.log(data)
            return data;
        } else {
            const error = new Error(data.message || 'Something went wrong');
            error.response = { data }; // Gán thêm dữ liệu để dễ dùng ở catch
            throw error;
        }

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

}

export const postData = async (url, formData) => {
    try {
        const response = await fetch(process.env.REACT_APP_API_URL + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
           
            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }

}
export const putData = async (url, payload) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    process.env.REACT_APP_API_URL + url,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return response.json();
}

export const editData = async (url, updatedData ) => {
    const { res } = await axios.put(`${process.env.REACT_APP_API_URL}${url}`,updatedData, params)
    return res;
}
export const editData2 = async (url, updatedData) => {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}${url}`, updatedData);
    return response.data;
}
export const deleteData = async (url ) => {
    const { res } = await axios.delete(`${process.env.REACT_APP_API_URL}${url}`, params)
    return res;
}


export const uploadImage = async (url, formData) => {
    const { res } = await axios.post(process.env.REACT_APP_API_URL + url , formData, params);
    return res;
}


export const deleteImages = async (url,image ) => {
    const { res } = await axios.delete(`${process.env.REACT_APP_API_URL}${url}`, params,image);
    return res;
}
// API Helper for Holy Cross Convent School App
// Handles all API communication with proper error handling

class ApiHelper {
  static async callPostAPI(url, payload) {
    console.log(`${url} -> payload ${JSON.stringify(payload)}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await ApiHelper.processResult(response);
    } catch (error) {
      console.error("Error while calling API", error, url);

      if (`${error}`.includes("Network request failed")) {
        // Handle network errors
      }

      throw new Error(`${error}`.replace("Error:", ""));
    }
  }

  static async processResult(response) {
    const contentType = response.headers.get('content-type');

    let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    if (!response.ok) {
      console.log(`Response ${JSON.stringify(response)}`);
      console.log(`Result ${JSON.stringify(result)}`);

      if (result && result.status) {
        if (result.status.success === false) {
          throw new Error(`${result.status.errorMessage}`);
        }

        if (result.status.validationFailed === true) {
          throw new Error(`${result.status.validationErrorMessage}`);
        }
      }
      throw new Error("Backend API not responded correctly status :" + response.status);
    }

    if (result.ResponseCode && result.ResponseCode.startsWith("20") === false) {
      throw new Error("Error :" + result.ResponseMsg);
    }

    if (result.status) {
      if (result.status.success === false) {
        throw new Error(`error ${result.status.errorMessage}`);
      }

      if (result.status.validationFailed === true) {
        throw new Error(`Validation error ${result.status.validationErrorMessage}`);
      }
    }

    return result;
  }

  static async callGetAPI(url) {
    console.log(`${url} -> GET request`);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return await ApiHelper.processResult(response);
    } catch (error) {
      console.error("Error while calling API", error);

      if (`${error}`.includes("Network request failed")) {
        // Handle network errors
      }

      throw new Error(`${error}`.replace("Error:", ""));
    }
  }
}

export { ApiHelper };

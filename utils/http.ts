import { BASE_URL } from "@/config";
import { HttpResponse } from "@/interfaces/HttpResponse";

interface HttpHeaders {
    [key: string]: string;
}
interface HttpOptions {
    method: string;
    headers?: HttpHeaders;
    body?: any;
    url:string;
}
class Http {
    private baseUrl : string = `${BASE_URL}`;

    private async request({ method, headers, url, body }: HttpOptions) {
    const isFormData = body instanceof FormData;

    const options: RequestInit = {
        method,
        headers: isFormData
        ? headers 
        : {
            'Content-Type': 'application/json',
            ...headers,
            },
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${this.baseUrl}${url}`, options);
        const data = await response.json();
        return {
        success: response.ok,
        status: response.status,
        data: data,
        } as HttpResponse;
    } catch (error) {
        console.error("Error en la petición: ", error);
        throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
    }

    get = (url:string, headers?: HttpHeaders) : Promise<HttpResponse> => {
        return this.request({method: 'GET',url,headers});
    }
    post = (url:string, body:any, headers?: HttpHeaders) : Promise<HttpResponse> => {
        return this.request({method: 'POST',url,body,headers});
    }
    put = (url:string, body:any, headers?: HttpHeaders) : Promise<HttpResponse> => {
        return this.request({method: 'PUT',url,body,headers});
    }
    delete = (url:string, headers?: HttpHeaders) : Promise<HttpResponse> => {
        return this.request({method: 'DELETE',url,headers});
    }
    patch = (url:string, body:any, headers?: HttpHeaders) : Promise<HttpResponse> => {
        return this.request({method: 'PATCH',url,body,headers});
    }

    getBaseUrl = () => this.baseUrl;
    setBaseUrl = (url:string) => 
        this.baseUrl = url;
    getFullUrl = (url:string) =>  `${this.baseUrl}${url}`;

}

const http = new Http();
export default http;
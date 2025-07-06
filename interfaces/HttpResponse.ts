export interface HttpResponse {    
    success:boolean;
    status: number;
    message:string;
    data: any;
    error?: string;
}
export class HttpClient {


    static get(url: string, options: RequestInit) {
        return HttpClient.fetch(url, {...options, method: 'GET'});
    }

    static post(url: string, options: RequestInit) {
        return HttpClient.fetch(url, {...options, method: 'POST'});
    }

    private static async fetch(url: string, options: RequestInit): Promise<Response> {
        try {
            console.debug('Request: ', url, options);
            const response = await fetch(url, options);

            console.debug('Response: ', {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                body: await response.clone().json()
            });

            return response;
        } catch (e: any) {
            console.error('Failed to fetch data', e);
            return Promise.reject(e);
        }
    }
}

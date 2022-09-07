class API {
    static options(vars, method = "POST") {
        let opts = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        };
        if (vars) {
            opts = {
                ...opts,
                body: JSON.stringify(vars),
            };
        }
        return opts;
    }

    static handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
}

export default API;
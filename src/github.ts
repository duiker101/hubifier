import moment from "moment";

export interface GHNotification {
    id: number;
    last_read_at: string;
    reason: string;
    unread: boolean;
    updated_at: string;
    data: any;
    url: string;
    subject: {
        title: string;
        type: string;
        url: string;
    };
    repository: {
        full_name: string;
        html_url: string;
        name: string;
    };
}

// let token = localStorage.getItem("auth_token");
// let token = chrome.storage.local.getItem("auth_token");
let token = "";
chrome.storage.local.get("auth_token").then(t => setToken(t['auth_token']));


const setToken = (t: string) => {
    token = t
    chrome.storage.local.set({"auth_token": t});
};

const getToken = () => token;

const getConfig = () => {
    return {cache: {maxAge: 1}, headers: {Authorization: `token ${token}`}};
};

const getUrl = (url: string) => {
    return fetch(url, {headers: {Authorization: `token ${token}`}, method: "GET"}).then((r) => {
        if (r.status === 200) return r.json();
    });
};

const putUrl = (url: string, data: object) => {
    return fetch(url, {
        headers: {Authorization: `token ${token}`},
        method: "PUT",
        body: JSON.stringify(data)
    }).then((r) => {
        if (r.status === 200) return r.json();
    });
};

const getNotifications = (): Promise<GHNotification[]> => {
    return getUrl("https://api.github.com/notifications?participating=true&t=" + moment().format());
};

const setRead = (date: moment.Moment) => {
    const datestr = date.format();
    return putUrl("https://api.github.com/notifications?last_read_at=" + datestr, {
        last_read_at: datestr,
    });
};

export default {
    getToken,
    setToken,
    getUrl,
    setRead,
    getNotifications,
};

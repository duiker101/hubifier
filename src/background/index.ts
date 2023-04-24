import github, {GHNotification} from "../github";
import moment from "moment";

let lastFetch = moment("2019-10-01");
let notifications: GHNotification[] = [];

const fetchNotifications = async () => {
    const fetchDate = moment();
    const token = github.getToken()
    if (token == null || token.length <= 0) return;

    github.getNotifications().then((from_api) => {
        // list of new notifications
        let newer = from_api.filter((f) => !notifications.some((n) => f.id === n.id));
        // remove notifications that are no longer visible
        const filtered = notifications.filter((f) => from_api.some((n) => f.id === n.id));

        newer = newer.map((n) => {
            github.getUrl(n.subject.url).then((r) => {
                n.data = r;
                showNotification(n);
            });
            return n;
        });

        const newNotifications = [...newer, ...filtered];
        newNotifications.sort(
            (a, b) => (moment(b.updated_at) as any) - (moment(a.updated_at) as any)
        );

        notifications = newNotifications;

        lastFetch = fetchDate;
        updateBadge();
    });
};

const showNotification = (n: GHNotification) => {
    const not = new Notification(n.repository.full_name, {body: n.subject.title});
    not.onclick = (e) => {
        not.close();
        openNotification(n);
    };
};

const updateBadge = () => {
    if (notifications.length > 0) {
        chrome.action.setBadgeBackgroundColor({color: "#076CE2"});
        chrome.action.setBadgeText({text: "" + notifications.length});
    } else {
        // chrome.browserAction.setBadgeBackgroundColor({color: "#ffffff00"});
        chrome.action.setBadgeText({text: ""});
    }
};

const openNotification = (n: GHNotification | undefined) => {
    if (!n)
        return;
    console.log("open", n);
    notifications = notifications.filter((ni) => ni.id !== n.id);
    updateBadge();
    chrome.tabs.create({url: n.data.html_url});
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "set_token") {
        github.setToken(message.token);
    }
    if (message.type === "getNotifications") {
        sendResponse({notifications, lastFetch: lastFetch.format("HH:mm")});
    }
    if (message.type === "read") {
        openNotification(notifications.find((n) => n.id === message.id));
        notifications = notifications.filter((n) => n.id !== message.id);
        updateBadge();
        sendResponse({notifications});
    }
    if (message.type === "read_all") {
        github.setRead(lastFetch).then(() => {
            notifications = [];
            updateBadge();
            sendResponse({notifications: []});
        });
    }
});

setInterval(fetchNotifications, 10000);
fetchNotifications();

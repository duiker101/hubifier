import "./index.scss";
import Notification from "./Notification";
import Auth from "./Auth";
import React, {useEffect, useState} from "react";
import {GHNotification} from "../github";
import {createRoot} from "react-dom/client";

const App = () => {
    const [notifications, setNotifications] = useState<GHNotification[]>([]);
    const [lastFetch, setLastFetch] = useState("");
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const r = await chrome.storage.local.get("auth_token");
            console.log(r)
            setToken(r['auth_token'])
        }

        load()
    }, [])


    useEffect(() => {
        chrome.runtime.sendMessage({type: "getNotifications"}, (data) => {
            setNotifications(data.notifications);
            setLastFetch(data.lastFetch);
        });
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem("auth_token", token);
            chrome.runtime.sendMessage({type: "set_token", token}, (data) => {
            });
        }
    }, [token]);

    const onOpen = (id: number) => {
        chrome.runtime.sendMessage({type: "read", id}, (data) => {
            setNotifications(data.notifications);
        });
    };

    const readAll = () => {
        chrome.runtime.sendMessage({type: "read_all"}, (data) => {
            setNotifications([]);
        });
    };

    if (!token) {
        return <Auth onToken={(token) => setToken(token)}/>;
    }

    return (
        <div>
            <div className={"notifications"}>
                {notifications.map((n) => (
                    <Notification {...n} onOpen={onOpen}/>
                ))}
            </div>
            <div className={"footer"}>
				<span className={"read"} onClick={readAll}>
					Read all
				</span>
                <span className={"time"}>Last Fetch: {lastFetch}</span>
            </div>
        </div>
    );
};

createRoot(document.getElementById('app') as HTMLElement).render(
    <App/>
)


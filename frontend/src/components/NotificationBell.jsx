"use client";

import { useEffect, useRef, useState } from "react";

export default function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);

    const socketRef = useRef(null);

    useEffect(() => {

        const token = localStorage.getItem("access");

        if (!token) return;

        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
        );

        socketRef.current.onopen = () => {
            console.log("🔔 Notification Connected");
        };

        socketRef.current.onmessage = (event) => {

            const data = JSON.parse(event.data);

            setNotifications(prev => [
                data,
                ...prev
            ]);

            // Facebook style popup
            setToast(data);

            setTimeout(() => {
                setToast(null);
            }, 4000);

        };

        socketRef.current.onclose = () => {
            console.log("Notification Closed");
        };

        return () => {

            if(socketRef.current){
                socketRef.current.close();
            }

        };

    }, []);

    return (

        <>

            {/* Popup */}

            {
                toast &&

                <div
                    style={{
                        position:"fixed",
                        top:20,
                        right:20,
                        width:"330px",
                        background:"#fff",
                        border:"1px solid #ddd",
                        borderRadius:"10px",
                        boxShadow:"0px 5px 20px rgba(0,0,0,.25)",
                        padding:"15px",
                        zIndex:9999,
                        animation:"fadeIn .3s"
                    }}
                >

                    <div
                        style={{
                            fontWeight:"bold",
                            fontSize:"16px",
                            marginBottom:"5px"
                        }}
                    >
                        🔔 {toast.title}
                    </div>

                    <div>
                        {toast.message}
                    </div>

                    <small>
                        Workspace : {toast.workspace}
                    </small>

                </div>

            }

            {/* Notification List */}

            <div
                style={{
                    width:"320px",
                    border:"1px solid #ddd",
                    background:"#fafafa",
                    padding:"15px"
                }}
            >

                <h3>

                    🔔 Notifications

                    <span
                        style={{
                            background:"red",
                            color:"#fff",
                            borderRadius:"50%",
                            padding:"2px 8px",
                            marginLeft:"8px"
                        }}
                    >
                        {notifications.length}
                    </span>

                </h3>

                {
                    notifications.length===0 ?

                    <p>No Notifications</p>

                    :

                    notifications.map((n,index)=>(

                        <div
                            key={index}
                            style={{
                                borderBottom:"1px solid #ddd",
                                padding:"10px 0"
                            }}
                        >

                            <b>{n.title}</b>

                            <div>{n.message}</div>

                            <small>
                                Workspace : {n.workspace}
                            </small>

                        </div>

                    ))

                }

            </div>

        </>

    );

}
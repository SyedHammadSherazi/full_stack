
function MessageList() {
    const messages = [
        "Hello Next.js",
        "Welcome to React",
        "Learning Components",
        "Learning JSX",
        "Learning Next.js"
    ];

    return (
        <div>
            <h2>Messages</h2>

            <ul>
                {messages.map((message, index) => (
                    <li key={index}>
                        {message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MessageList;
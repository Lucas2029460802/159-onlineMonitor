import ChatSideBar from "./chatsidebar/chatsidebar";
import ChatLayout from "./components/chatLayout";

export default function Chat() {
    return (
        <div className="h-full w-full flex">
            <ChatSideBar />
            <div className="flex-grow-1 h-full flex flex-col items-center justify-center px-4 text-center bg-white">
                <ChatLayout />
            </div>
        </div>
    );
}

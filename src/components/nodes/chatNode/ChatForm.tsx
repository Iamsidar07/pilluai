import { ArrowRightIcon } from "lucide-react";
import React from "react";

interface ChatFormProps {
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  setUserMessageContent: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  input: string;
}

const ChatForm = ({
  input,
  handleInputChange,
  setUserMessageContent,
  handleSendMessage,
}: ChatFormProps) => {
  return (
    <div className="px-2 pt-1 bg-white shadow-sm rounded">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 pr-1 border rounded focus-within:shadow-sm"
      >
        <input
          type="text"
          className="flex-1 p-2 text-sm outline-none bg-transparent border-none"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => {
            handleInputChange(e);
            setUserMessageContent(e.target.value);
          }}
        />
        <button
          type="submit"
          className="w-5 h-5 bg-blue-500 rounded-full text-white grid place-items-center"
        >
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatForm;

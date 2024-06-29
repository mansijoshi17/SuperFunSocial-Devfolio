"use client";
import { IonIcon } from "@ionic/react";
import {
  addCircleOutline,
  closeOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { useState, useContext } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FarcasterContext } from "@/context/farcaster";
import { useNeynarContext } from "@neynar/react";
import { toast } from "react-toastify";

const PollInputForm = ({ togglePollModal }) => {
  const farcasterContext = useContext(FarcasterContext);
  const { CreatePoll } = farcasterContext;

  const { user } = useNeynarContext();

  const [pollOptions, setPollOptions] = useState([{ id: 1, value: "" }]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const handleAddChoice = () => {
    const newChoice = { id: pollOptions.length + 1, value: "" };
    setPollOptions([...pollOptions, newChoice]);
  };

  const handleRemoveChoice = (id) => {
    setPollOptions(pollOptions.filter((choice) => choice.id !== id));
  };

  const handleChangeChoice = (id, value) => {
    const updatedChoices = pollOptions.map((choice) =>
      choice.id === id ? { ...choice, value } : choice
    );
    setPollOptions(updatedChoices);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await axios
      .post("https://frame-backend-z2b9.onrender.com/polls/add", {
        title: pollQuestion,
        choices: pollOptions,
        endDate: endDate,
        fid: user.fid,
      })
      .then(async (res) => { 
       const txn= await CreatePoll(pollQuestion, pollOptions.length, res.data.data._id);
       console.log(txn,"txn");

        let arr = [];
        arr.push({
          url: `https://demo.superfun.social/api/poll/${res.data.data._id}`,
        });

        const options = {
          method: "POST",
          headers: {
            accept: "application/json",
            api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            signer_uuid: user?.signer_uuid,
            text: text,
            embeds: arr,
            parent: "/sfspolls",
          }),
        };

       await fetch("https://api.neynar.com/v2/farcaster/cast", options)
          .then((response) => {
            toast.success("Poll Created!");
            setLoading(false);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => {
        alert("Something went wrong!");
        console.error(err);
      });
  };

  return (
    <div className="bg-white dark:bg-dark3  rounded-lg shadow-lg  w-full max-w-2xl mx-auto z-10">
      <div className="flex justify-between items-center pb-2 mb-4 p-6">
        <h2 className="text-lg font-semibold">Create Poll</h2>
        <button onClick={togglePollModal} className="text-xl">
          <IonIcon icon={closeOutline} />
        </button>
      </div>
      <hr />
      <div className="p-6 overflow-y-scroll max-h-96">
        <textarea
          placeholder="What do you have in mind?"
          className="w-full p-2 border border-gray-300 rounded mb-4 resize-none"
          rows="4"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="text"
          placeholder="What is your poll question?"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={pollQuestion}
          onChange={(e) => setPollQuestion(e.target.value)}
        />
        {pollOptions.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder={`Option ${option.id}`}
              className="w-full p-2 border border-gray-300 rounded"
              value={option.value}
              onChange={(e) => handleChangeChoice(option.id, e.target.value)}
            />
            <button
              onClick={() => handleRemoveChoice(option.id)}
              className="text-red-500"
            >
              <IonIcon icon={removeCircleOutline} />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddChoice}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-blue-600 bg-blue-100 mb-4"
        >
          <IonIcon icon={addCircleOutline} />
          Add Option
        </button>

        <div>
          <label
            htmlFor="pollTitle"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="mt-1  w-full   border-black-300   sm:text-sm p-2 input border bg-pgray-100 rounded-xl border-pgray-100"
            showTimeSelect
            dateFormat="Pp"
          />
        </div>
        <div className="flex items-center justify-between">
          <button className="text-gray-600">Everyone can vote</button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Creating poll...." : "Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollInputForm;

/** @jsxImportSource frog/jsx */

import { Button, Frog } from "frog";
import { handle } from "frog/vercel";
import { getPoll, getVotes } from "../../../utils/poll"; 
import { neynar } from "frog/hubs"; 
import { contractABI } from "@/utils/contract"; 


const app = new Frog({
  basePath: "/api",
  hub: neynar({ apiKey: process.env.NEXT_PUBLIC_NEYNAR_API_KEY }),
});

async function generatePlaceholderURL(pollData, votes) {
  const title = encodeURIComponent(pollData.title);
  let text = `${title}%0A`;

  text += `Total%20Votes%0A`;

  // Append each choice and its votes
  pollData.choices.forEach((choice, index) => {
    if (votes[index] == undefined) {
      text += `${encodeURIComponent(choice.value)}:%20${0}%0A`;
    } else {
      text += `${encodeURIComponent(choice.value)}:%20${votes[index]}%0A`;
    }
  });

  // Construct the final URL
  return `https://via.placeholder.com/700x500/white/black?text=${text}`;
}

app.frame("/poll/:id", async (c) => {
  const id = c.req.param("id");
  const pollData = await getPoll(id); // Retrieve the poll data based on the link
  var formattedTime;

  if (pollData) {
    const dateString = pollData.endDate; 
    const date = new Date(dateString);

    const days = date.getUTCDate() - 1;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    formattedTime = `${days}:${hours}:${minutes}:${seconds}`;
  }
  return c.res({
    action: `/wait/${pollData._id}`,
    image: `https://via.placeholder.com/600x400/white/black?text=${pollData.title}%0A%0AEnding In : ${formattedTime}`,
    intents: pollData.choices.map((choice) => {
      return (
        <Button.Transaction target={`/vote/${pollData._id}/${choice.id}`}>
          {choice.value}
        </Button.Transaction>
      );
    }),
  });
});

app.transaction("/vote/:pollId/:choice", async (c) => {
  const pollId = c.req.param("pollId");
  const choice = c.req.param("choice");
  const signer = c.req.body;
  const pollData = await getPoll(pollId); // Retrieve the poll data based on the link 
  const fid = pollData.fid; 
   
  return  c.contract({
    abi: contractABI,
    chainId: 'eip155:84532',
    functionName: 'vote',  
    args: [pollId, choice],
    attribution: true,
    to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  }); 
});

app.frame("/wait/:id", (c) => {
  const { transactionId } = c;
  const pollId = c.req.param("id");
  return c.res({ 
    action: `/voted/${pollId}`,
    // image: (
    //   <div  style={{fontSize: 48, color:'black', textAlign:'center', padding:'20px'}}>
    //     {transactionId
    //       ? `Your vote is being recorded on the blockchain. Thank you :)`
    //       : "Your vote is being recorded on the blockchain. This may take a few moments."}
    //   </div>
    // ),
    image: `https://via.placeholder.com/600x400/white/black?text=Your vote is being recorded on the blockchain. Thank you :)`,
    intents: [<Button.Transaction target={`/voted/${pollId}`}>View Votes</Button.Transaction>],
  });
});

app.frame("/voted/:id", async (c) => {
  const pollId = c.req.param("id");
  const pollData = await getPoll(pollId); // Retrieve the poll data based on the link
  let votes = await getVotes(pollId);
  let url = await generatePlaceholderURL(pollData, votes); 

  return c.res({
    image: url,
  });
}); 

export const GET = handle(app);
export const POST = handle(app);

import React from "react";
import ChatBot from "react-chatbotify";
import botSettings from "./settings.json";
import themeStyles from "./styles.json";
import "./styles.css";

const MyChatBot = () => {
	const [form, setForm] = React.useState({});
	const formStyle = {
		marginTop: 10,
		marginLeft: 20,
		border: "1px solid #491d8d",
		padding: 10,
		borderRadius: 5,
		maxWidth: 300
	}

	const flow = {
		start: {
		  message: "Hello there! What is your name?",
		  function: (params) => setForm({ ...form, name: params.userInput }),
		  path: "ask_help",
		},
	  
		ask_help: {
		  message: (params) => `How can I help you, ${params.userInput}? Please select one or more options:`,
		  checkboxes: {
			items: [
			  "Time Work?",
			  "How to checkout",
			  "Can't see product",
			  "Contact to admin"
			],
			min: 1, // At least one option must be selected
			max: 4, // Maximum of four options
		  },
		  chatDisabled: false,
		  function: (params) => setForm({ ...form, help_choice: params.userInput }),
		  path: "handle_choice",
		},
	  
		handle_choice: {
		  message: (params) => {
			let response = "";
			if (params.userInput.includes("Time Work?")) {
			  response += "OPEN TIME: All Time. ";
			}
			if (params.userInput.includes("How to checkout")) {
			  response += "CHECK OUT: 1. Go to cart 2. Checkout 3. Fill all fields 4. Submit. ";
			}
			if (params.userInput.includes("Can't see product")) {
			  response += "DISPLAY: Check your internet or refresh the page. ";
			}
			if (params.userInput.includes("Contact to admin")) {
			  response += "CONTACT: You can contact us at: Phone: 0387445808, Email: minhthien12149@gmail.com (within 2 hours). ";
			}
			setForm({ ...form, response });
			return response || "Sorry, I didn't quite understand that. Please select one of the options. ";
		  },
		  	options: ["Ask Again"],
			chatDisabled: true,
			path: "ask_help",
		},
	  
		
	  };
	  
	  
	  
	return (
		<ChatBot settings={botSettings} styles={themeStyles} flow={flow}/>
	);
};

export default MyChatBot;
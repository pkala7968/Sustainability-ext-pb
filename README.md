# <img src="extension/icon.png" alt="logo" width="32" height="32"> Eco-Rating Chrome Extension

A Chrome Extension that analyzes product listings and provides an **Eco-Friendliness Score** based on the materials used in the product. It uses a **LangChain-powered FastAPI backend** to evaluate the sustainability of product components.

Works with (so far):
- Amazon
- Flipkart
- Walmart
> ...more coming soon!
---

## Features

- Extracts product title, description, and bullet points from Amazon/Flipkart.
- Sends the data to a FastAPI server that:
  - Uses LangChain + Gemini Flash
  - Rates the product’s environmental friendliness (1–5)
  - Identifies materials used
  - Returns reasoning behind the rating
- Results shown directly in the popup.
- Shows cleaner products as an alternative if eco-score is low.

---

## Tech Stack

- **Frontend**: Chrome Extension (Manifest V3), JavaScript
- **Backend**: FastAPI + LangChain + Gemini Flash (GoogleGenerativeAI)
- **RAG**: Retrieval-Augmented Generation using Chroma vector store and FAISS

---

## Setup Instructions

### Steps

1. **Clone the Repository**
```bash
git clone https://github.com/pkala7968/Eco-rating-extension.git
cd eco-rating-extension
```
2. **Install Dependencies:**
```bash
pip install -r requirements.txt
```
3. **Load the Extension into Chrome**
- Open Chrome and go to `chrome://extensions/`
- Turn on the Developer Mode toggle (top right)
- Click “Load unpacked”
- In the file picker, select the `extension/` folder from this repo
>You should now see the Eco-Rating extension in your Chrome extension bar.
4. **Run the Backend**
- Create a `.env` file and add your Gemini API key:
```ini
GOOGLE_API_KEY=your_api_key_here
```
- Navigate to the backend directory and run the FastAPI backend:
```bash
cd backend
uvicorn app:app --reload
```
>This starts the backend on `http://localhost:8000`
5. **Use the Extension**
- Go to any supported e-commerce site (e.g., Amazon, Flipkart)
- Open the product page for any item
- Click the Eco-Rating extension icon in your browser
- Click the “Analyze Product” button
- The popup will:
  - Extract product info from the page
  - Call the backend API to compute an eco-score
  - Show the score, materials, reasoning, and a greener alternative (if any)

---

## Check It Out!

![initial](imgs/initial.png)

![analysis](imgs/analysis.png)

---
## ⚠️ Note

This is still under production; will be out for use soon!
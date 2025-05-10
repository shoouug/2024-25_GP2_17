
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './HomePage.css';
import sunIcon from '../images/sun.png';
import moonIcon from '../images/moon.png';
import exitIcon from '../images/exit.png';
import logo from '../images/GenNews.png';
import ProfileIcon from '../images/ProfileIcon.png';
import sendIcon from '../images/sendbutton.png'; // Import send icon
import forward from '../images/forward.png';
import Backward from '../images/Backward.png';
import EditProfile from './EditProfile';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import exclamation_mark from '../images/exclamation_mark.png';
import whiteExclamationMark from '../images/white-exclamation-mark.png';
import FeedbackModal from './FeedbackModal';
import Export from '../images/export.png';
import edit from '../images/edit.png';
import AddImage from '../images/AddImage.png';

import { getCroppedImg } from '../Pages/cropImage'; 
import Cropper from 'react-easy-crop';
import Draggable from 'react-draggable';

import { Document, Packer, Paragraph, TextRun, ImageRun} from 'docx';
import { saveAs } from 'file-saver';


const HomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [journalistName, setJournalistName] = useState("Journalist Name");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [articleContent, setArticleContent] = useState("");
  const [isArticleGenerated, setIsArticleGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const navigate = useNavigate();
  const [topicError, setTopicError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [popupKeyword, setPopupKeyword] = useState(""); // For the popup keyword input
  const [showKeywordPopup, setShowKeywordPopup] = useState(false); // To toggle the popup
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [topicArticles, setTopicArticles] = useState({});
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [linguisticPrint, setLinguisticPrint] = useState(null); // Store linguistic print
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportPosition, setExportPosition] = useState({ top: 0, left: 0 });
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [images, setImages] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [step, setStep] = useState(1);
  const [feedbackMessageW, setFeedbackMessageW] = useState('');
  const [intendedAnswer, setIntendedAnswer] = useState('');
  const [styleAnswer, setStyleAnswer] = useState('');
  const [userId, setUserId] = useState(null);
  // at the top of your HomePage component
const [feedbackGiven, setFeedbackGiven] = useState(new Set());

const [showFeedback, setShowFeedback] = useState(false);
const [pendingAction, setPendingAction] = useState(null);
const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
const [error, setError] = useState(null); 

// For Images
const [isCropping, setIsCropping] = useState(false);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
const [croppingImageUrl, setCroppingImageUrl] = useState(null);
const [croppingImageId, setCroppingImageId] = useState(null);
const [selectedImage, setSelectedImage] = useState(null);
const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
const [loading, setLoading] = useState(false);
const [article, setArticle] = useState(null);

 useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.chat-item-with-buttons')) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!topic) return;

    setIsLoadingTopics(true);
    setError(null);

    fetch(`${BASE_URL}/news?topic=${encodeURIComponent(topic)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch news");
        return res.json();
      })
      .then(data => {
        setTopicArticles(data.articles || []);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("حدث خطأ أثناء جلب الأخبار");
      })
      .finally(() => {
        setIsLoadingTopics(false);
      });
  }, [topic]);

  useEffect(() => {
    if (selectedChat) {
      setArticleContent(selectedChat.versions[0] || "");
      setIsArticleGenerated(true);
    }
  }, [selectedChat]);

  const handleEditClick = (chat) => {
    setSelectedChat(chat); //ope chat
    setIsEditing(true);    //turn (edite) option on 
  };

  const handleDotsClick = (event, index) => {
    const rect = event.target.getBoundingClientRect();
    setOpenDropdownIndex(index);
    setDropdownPosition({ top: rect.bottom + 5, left: rect.left + 5 });
  };

  useEffect(() => {
  const loadImagesForChat = async () => {
    if (!selectedChat) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "Journalists", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const exportedImages = docSnap.data().exportedImages || {};
        const chatImages = exportedImages[selectedChat.title] || [];
        setImagesMap((prev) => ({
          ...prev,
          [selectedChat.title]: chatImages,
        }));
      }
    } catch (err) {
      console.error("❌ Could not load saved images from Firestore:", err);
    }
  };

  loadImagesForChat();
}, [selectedChat]);
  

  const handleDeleteClick = async (chatToDelete) => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const userRef = doc(db, "Journalists", user.uid);
      const updatedChats = chats.filter(chat => chat !== chatToDelete);
  
      await updateDoc(userRef, {
        savedArticles: updatedChats, // أو previousArticles حسب ما تستخدمين
      });
  
      setChats(updatedChats);
      if (selectedChat === chatToDelete) {
        setSelectedChat(null);
        setIsArticleGenerated(false);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };
  

  const handleTopicClick = async (topic) => {
    setLoading(true);
    try {
      const res = await fetch(`/generate-article/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setArticle(data.article);
    } catch (err) {
      console.error("Error generating article:", err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleKeywordPopupOpen = () => {
    setPopupKeyword(keyword);
    setShowKeywordPopup(true);
  };

  const handleKeywordPopupSave = () => {
    setKeyword(popupKeyword);
    setShowKeywordPopup(false);

    // Update the article content dynamically with keywords
    if (selectedChat) {
      const updatedContent = `${topic} ${popupKeyword}`;
      setArticleContent(updatedContent);

      const updatedChats = chats.map((chat) =>
        chat === selectedChat ? { ...chat, content: updatedContent } : chat
      );
      setChats(updatedChats);

      const saveUpdatedArticleToFirestore = async () => {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "Journalists", user.uid);
          await updateDoc(userRef, {
            savedArticles: updatedChats,
          });
        }
      };
      saveUpdatedArticleToFirestore();
    }
  };


  const handleAutogeneratedClick = async (article) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
  
      const response = await fetch("http://127.0.0.1:8000/generate-article/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: article.title,
          user_id: user.uid,
          keywords: "",
        }),
      });
  
      if (!response.ok) throw new Error("Failed to generate article");
  
      const aiData = await response.json();
      const newChat = {
        title: article.title,
        versions: [aiData.article],
        timestamp: new Date().toLocaleString(),
      };
  
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
      setArticleContent(aiData.article);
      setIsArticleGenerated(true);
    } catch (err) {
      console.error("Error generating article from topic card:", err);
    }
  };

  const handleKeywordPopupCancel = () => {
    setShowKeywordPopup(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("dark-mode", newMode);
      if (newMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
      return newMode;
    });
  };

  useEffect(() => {
    const isDarkModeEnabled = localStorage.getItem("dark-mode") === "true";
    setIsDarkMode(isDarkModeEnabled);
    if (isDarkModeEnabled) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "Journalists", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setJournalistName(`${data.firstName} ${data.lastName}`);
          setSelectedTopics(data.selectedTopics || []);
          setUserData(data);

          const sortedChats = (data.savedArticles || []).sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });

          setChats(sortedChats);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      navigate("/");
    }
  };
  // Helper function to extract the publisher's name from a URL
  const extractPublisher = (url) => {
    try {
      const parsedUrl = new URL(url);
      let hostname = parsedUrl.hostname;
      // Remove 'www.' if present
      if (hostname.startsWith("www.")) {
        hostname = hostname.substring(4);
      }
      // Optionally, take the first part of the domain (e.g., "yahoo" from "yahoo.com")
      const parts = hostname.split(".");
      return parts[0];
    } catch (err) {
      return "unknown";
    }
  };
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData();
      } else {
        setUserId(null);
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // NEW: After we have the selectedTopics, fetch news for each topic
  useEffect(() => {
    if (selectedTopics.length > 0) {
      const fetchAllTopics = async () => {
        setIsLoadingTopics(true);
        const newTopicArticles = {};

        for (const t of selectedTopics) {
          try {
            // Replace 127.0.0.1 with your backend URL if needed
            const user = auth.currentUser;
            const res = await fetch(`http://127.0.0.1:8000/news?topic=${t}`);
            if (!res.ok) {
              throw new Error(`Failed to fetch news for topic: ${t}`);
            }
            const data = await res.json();
            newTopicArticles[t] = [data]; // because it's a single article now, not an array // ✅ Fix this line
          } catch (err) {
            console.error("Error fetching news for topic:", t, err);
            newTopicArticles[t] = []; // fallback to empty
          }
        }

        setTopicArticles(newTopicArticles);
        setIsLoadingTopics(false);
      };

      fetchAllTopics();
    }
  }, [selectedTopics]);

  const handleNewChat = () => {
    // ← original body ↓
    setSelectedChat(null);
    setArticleContent("");
    setIsArticleGenerated(false);
    setTopic("");
    setKeyword("");
  };
  
  

  const [isLoading, setIsLoading] = useState(false); // ✅ Loading state
  const [selectedTopic, setSelectedTopic] = useState("");

  const handleGenerateArticle = async (selectedTopic, enteredKeywords) => {
    if (!selectedTopic.trim()) {
      setTopicError("Topic is required to generate an article.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
  
      console.log("📡 Sending request to backend...");
  
      const response = await fetch("http://127.0.0.1:8000/generate-article/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: selectedTopic,
          user_id: user.uid,
          keywords: enteredKeywords,
        }),
      });
  
      if (!response.ok) throw new Error("AI article generation failed");
  
      const aiData = await response.json();
  
      if (!aiData || !aiData.article) throw new Error("AI did not return a valid article");
  
      console.log("📝 Full AI Article Received:", aiData.article);
      console.log("📊 Linguistic Print:", aiData.linguistic_print);
  
      setLinguisticPrint(aiData.linguistic_print);
  
      const existingTitles = chats.map(c => c.title);
      let uniqueTitle = selectedTopic;
  
      try {
        const titleResponse = await fetch("http://127.0.0.1:8000/generate-title/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: selectedTopic,
            user_id: user.uid,
            existing_titles: existingTitles,
          }),
        });
  
        const titleData = await titleResponse.json();
        if (titleResponse.ok && titleData.title) {
          uniqueTitle = titleData.title;
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch unique title, using topic instead:", err);
      }
  
      const newChat = {
        title: uniqueTitle,
        versions: [aiData.article],
        timestamp: new Date().toLocaleString(),
        linguisticPrint: aiData.linguistic_print,
      };
  
      // FIRST update state
      setChats((prevChats) => {
        const updatedChats = [newChat, ...prevChats];
        saveChatsToFirestore(updatedChats); // ✅ Save after updating state
        return updatedChats;
      });
  
      setSelectedChat(newChat);
      setArticleContent(aiData.article);
      setIsArticleGenerated(true);
      setTopic("");
  
    } catch (error) {
      console.error("❌ Error generating article:", error);
      setTopicError("Failed to generate article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create helper function:
  const saveChatsToFirestore = async (chatsToSave) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "Journalists", user.uid);
      await updateDoc(userRef, {
        savedArticles: chatsToSave.map(chat => ({
          title: chat.title || "",
          versions: Array.isArray(chat.versions) ? chat.versions : [],
          timestamp: chat.timestamp || "",
          linguisticPrint: chat.linguisticPrint ? {
            avg_sentence_length: chat.linguisticPrint.avg_sentence_length || 0,
            readability_score: chat.linguisticPrint.readability_score || 0,
            tone: chat.linguisticPrint.tone || "",
            voice_preference: chat.linguisticPrint.voice_preference || "",
            personal_vs_impersonal: chat.linguisticPrint.personal_vs_impersonal || "",
            most_common_words: (chat.linguisticPrint.most_common_words || []).map(w => (Array.isArray(w) ? w[0] : w)),
            most_common_punctuation: (chat.linguisticPrint.most_common_punctuation || []).map(p => (Array.isArray(p) ? p[0] : p)),
            most_common_bigrams: (chat.linguisticPrint.most_common_bigrams || []).map(b => Array.isArray(b) ? b.join(" ") : b),
            most_common_trigrams: (chat.linguisticPrint.most_common_trigrams || []).map(t => Array.isArray(t) ? t.join(" ") : t),
            most_common_quadgrams: (chat.linguisticPrint.most_common_quadgrams || []).map(q => Array.isArray(q) ? q.join(" ") : q),
            most_common_nouns: (chat.linguisticPrint.most_common_nouns || []).map(n => (Array.isArray(n) ? n[0] : n)),
            most_common_verbs: (chat.linguisticPrint.most_common_verbs || []).map(v => (Array.isArray(v) ? v[0] : v)),
            most_common_adjectives: (chat.linguisticPrint.most_common_adjectives || []).map(a => (Array.isArray(a) ? a[0] : a)),
            most_common_adverbs: (chat.linguisticPrint.most_common_adverbs || []).map(a => (Array.isArray(a) ? a[0] : a)),
          } : {}
        })),
      });
      console.log("✅ Successfully saved chats to Firestore!");
    }
  };

  const handleBackward = () => {
    if (selectedChat && currentVersionIndex > 0) {
      const newIndex = currentVersionIndex - 1;
      setCurrentVersionIndex(newIndex);
      setArticleContent(selectedChat.versions[newIndex]); // Ensure this is a string
    }
  };

  const handleForward = () => {
    if (
      selectedChat &&
      currentVersionIndex < selectedChat.versions.length - 1
    ) {
      const newIndex = currentVersionIndex + 1;
      setCurrentVersionIndex(newIndex);
      setArticleContent(selectedChat.versions[newIndex]); // Ensure this is a string
    }
  };

  const handleSave = async () => {
    if (!selectedChat) return;

    const updatedVersions = [...selectedChat.versions];
    // Update the current version with the latest content as a string
    updatedVersions[currentVersionIndex] = articleContent;

    const updatedChat = { ...selectedChat, versions: updatedVersions };

    // Update the chats array with the modified chat
    const updatedChats = chats.map((chat) =>
      chat === selectedChat ? updatedChat : chat
    );

    setChats(updatedChats);
    setSelectedChat(updatedChat);

    // Save the changes to Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "Journalists", user.uid);
        await updateDoc(userRef, {
          savedArticles: updatedChats,
        });
      } catch (error) {
        console.error("Error saving edited article:", error);
      }
    }

    setIsEditing(false); // Stop editing mode
  };


  //
  const handleChatClick = async (chat) => {
  setSelectedChat(chat);
  setArticleContent(chat.versions[0] || "");
  setCurrentVersionIndex(0);
  setIsArticleGenerated(true);
  setIsSidebarOpen(false);

  const user = auth.currentUser;
  if (user) {
    try {
      const userRef = doc(db, "Journalists", user.uid);
    } catch (error) {
      console.error("❌ Failed to load saved images:", error);
    }
  }
};

  const handleLogout = () => {
    navigate("/");
  };

  const handleArticleChange = (e) => {
    setArticleContent(e.target.value);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const doExport = async () => {
    if (!selectedChat) return;
    const user = auth.currentUser;
    if (!user) return console.error("User not authenticated");
  
    const exportedArticle = {
      title: selectedChat.title,
      content: articleContent,
      timestamp: new Date().toLocaleString(),
    };
  
    try {
      const userRef = doc(db, "Journalists", user.uid);
      const userSnap = await getDoc(userRef);
      let existingExportedArticles = [];
  
      if (userSnap.exists()) {
        existingExportedArticles = userSnap.data().exportedArticles || [];
      }
  
      const updatedExportedArticles = [exportedArticle, ...existingExportedArticles];
  
      await updateDoc(userRef, {
        exportedArticles: updatedExportedArticles,
      });
  
      console.log("✅ Article saved to exportedArticles in Firestore");
    } catch (error) {
      console.error("❌ Error saving exported article to Firestore:", error);
    }
  
    // ✨ Ask user for export type
    const choice = window.prompt("Export as 'pdf' or 'docx'? (Type exactly: pdf or docx)");
  
    if (choice === "pdf") {
      const docPDF = new jsPDF();
      docPDF.text(selectedChat.title, 10, 10);
      docPDF.text(articleContent, 10, 20);
      docPDF.save(`${selectedChat.title}.pdf`);
    } else if (choice === "docx") {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: selectedChat.title, bold: true, size: 32 }),
                new TextRun({ text: "\n\n" + articleContent, size: 24 }),
              ],
            }),
          ],
        }],
      });
  
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${selectedChat.title}.docx`);
    } else {
      alert("❌ Invalid choice. Please type either 'pdf' or 'docx'.");
    }
  };

  const exportAs = async (format) => {
    setShowExportOptions(false);
    if (!selectedChat) return;
  
    if (format === "pdf") {
      const docPDF = new jsPDF();
      docPDF.text(selectedChat.title, 10, 10);
      docPDF.text(articleContent, 10, 20);
      docPDF.save(`${selectedChat.title}.pdf`);
    } else if (format === "docx") {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: selectedChat.title, bold: true, size: 32 }),
                new TextRun({ text: "\n\n" + articleContent, size: 24 }),
              ],
            }),
          ],
        }],
      });
  
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${selectedChat.title}.docx`);
    }
  };

  const handleProfileClick = () => {
    setShowTooltip((prev) => !prev);
  };

  const handleEditProfile = () => {
    navigate("/editprofile", { state: { userData } });
  };

  const handleKeywordUpdate = () => {
    if (selectedChat) {
      const updatedContent = `${keyword}`;
      setArticleContent(updatedContent);
      setKeyword("");

      const updatedChats = chats.map((chat) =>
        chat === selectedChat ? { ...chat, content: updatedContent } : chat
      );
      setChats(updatedChats);

      const saveUpdatedArticleToFirestore = async () => {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "Journalists", user.uid);
          await updateDoc(userRef, {
            savedArticles: updatedChats,
          });
        }
      };
      saveUpdatedArticleToFirestore();
    }
  };

  const handleTitleChange = (newTitle) => {
    if (!selectedChat) return;

    // Update the selected chat's title
    const updatedChat = { ...selectedChat, title: newTitle };

    // Update the chats array with the modified chat
    const updatedChats = chats.map((chat) =>
      chat === selectedChat ? updatedChat : chat
    );

    setChats(updatedChats);
    setSelectedChat(updatedChat);

    // Update Firestore
    const user = auth.currentUser;
    if (user) {
      const updateTitleInFirestore = async () => {
        try {
          const userRef = doc(db, "Journalists", user.uid);
          await updateDoc(userRef, {
            savedArticles: updatedChats,
          });
        } catch (error) {
          console.error("Error updating chat title in Firestore:", error);
        }
      };
      updateTitleInFirestore();
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
  
    if (diffInSeconds < 60) return `منذ ${diffInSeconds} ثانية`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسبوع`;
    if (diffInDays < 365) return `منذ ${Math.floor(diffInDays / 30)} شهر`;
    return `منذ ${Math.floor(diffInDays / 365)} سنة`;
  };

  //here also changes
  // In your HomePage component, add this new handler function:
  // Helper function to extract domain name from a URL
  const extractDomain = (url) => {
    try {
      const parsedUrl = new URL(url);
      // Remove "www." for a cleaner appearance
      return parsedUrl.hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };
  
  const wrappedNewChat = () => {
    if (selectedChat && !feedbackGiven.has(selectedChat.title)) {
          setPendingAction(() => handleNewChat);
          setShowFeedback(true);
         } else {
           // Either no article yet, or feedback is already done → just clear
           handleNewChat();
 
         }
       };
      
   const exportDocx = async () => {
  if (!selectedChat) return;
  const user = auth.currentUser;
  if (!user) return;

  const chatTitle = selectedChat.title;
  const children = [
    new Paragraph({
      children: [
        new TextRun({ text: chatTitle, bold: true, size: 32 }),
        new TextRun({ text: "\n\n" + articleContent, size: 24 }),
      ],
    }),
  ];

  const currentImages = imagesMap[chatTitle] || [];

  for (const imgObj of currentImages) {
    try {
      const isBase64 = imgObj.url.startsWith("data:image/");
      if (!isBase64) {
        console.warn("⚠️ Skipping non-base64 image:", imgObj.url);
        continue;
      }

      const base64Match = imgObj.url.match(/^data:image\/(png|jpeg|jpg);base64,(.*)$/);
      if (!base64Match) {
        console.warn("⚠️ Malformed base64 image. Skipped.");
        continue;
      }

      const base64Data = base64Match[2];
      const binaryString = atob(base64Data);
      const buffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        buffer[i] = binaryString.charCodeAt(i);
      }

      // Append image to document
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: 500, height: 280 },
            }),
          ],
        })
      );
    } catch (err) {
      console.error("❌ Error processing image for DOCX:", err);
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${chatTitle}.docx`);
  console.log("✅ Exported with images");
};


  const wrappedExport = (event) => {
    if (!selectedChat) return;
    const title = selectedChat.title;
  
    if (!feedbackGiven.has(title)) {
      setPendingAction(() => exportDocx);
      setShowFeedback(true);
    } else{
      
      exportDocx();
  
    
    }
  };
 
  

  function handleFeedbackComplete() {
    setShowFeedback(false);
  
    // remember that for this article, we've now got feedback
    if (selectedChat) {
      setFeedbackGiven(prev => {
        const next = new Set(prev);
        next.add(selectedChat.title);
        return next;
      });
    }
  
    // then carry out whichever action was pending
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }
  
  

  
  const handleResourceClick = async (article) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
  
      console.log("📡 Generating full article for:", article.title);
  
      // Call your backend to generate the full article using the article title as the prompt.
      const response = await fetch("http://127.0.0.1:8000/generate-article/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: article.title,
          user_id: user.uid,
          keywords: "" // No extra keywords for resource-based generation
        }),
      });
  
      if (!response.ok) throw new Error("AI article generation failed");
  
      const aiData = await response.json();
      if (!aiData || !aiData.article) throw new Error("No article generated");
  
      const fullArticle = aiData.article;
  
      // Build signature using journalist details from userData.
      // Build the signature using the journalist's details from userData.
const journalistTitle = userData?.title ? `${userData.title} ` : "";
const firstName = userData?.firstName || "Anonymous";
const lastName = userData?.lastName || "";
// after
// build and trim the signature
const signature = `By ${journalistTitle}${firstName} ${lastName}`.trim();

// trim your incoming article
let fullArticleWithSignature = fullArticle.trim();

// only append if we actually have a signature, and it doesn’t already appear
if (signature && !fullArticleWithSignature.includes(signature)) {
  fullArticleWithSignature += `\n\n${signature}`;
}


console.log("📝 Full article received:", fullArticleWithSignature);

//diff titles
// ✨ Step 1: Get all existing titles
const existingTitles = chats.map(chat => chat.title);

// ✨ Step 2: Generate a new unique title using AI
let uniqueTitle = article.title; // fallback
try {
  const titleResponse = await fetch("http://127.0.0.1:8000/generate-title/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: article.title, // use the original topic/title
      user_id: user.uid,
      existing_titles: existingTitles
    }),
  });

  const titleData = await titleResponse.json();
  if (titleResponse.ok && titleData.title) {
    uniqueTitle = titleData.title;
  }
} catch (err) {
  console.warn("⚠️ Failed to generate unique title from AI, using fallback:", err);
}

// ✨ Step 3: Create the new chat with AI-generated title
const newChat = {
  title: uniqueTitle,
  versions: [fullArticleWithSignature],
  timestamp: new Date().toLocaleString(),
};


setChats((prevChats) => [newChat, ...prevChats]);
setSelectedChat(newChat);
setArticleContent(fullArticleWithSignature);
setCurrentVersionIndex(0);
setIsArticleGenerated(true);

      // Save the new chat to Firestore.
      const userRef = doc(db, "Journalists", user.uid);
      await updateDoc(userRef, {
        savedArticles: [newChat, ...chats],
      });
    } catch (error) {
      console.error("Error generating full article from resource:", error);
      setTopicError("Failed to generate full article from the resource. Please try again.");
    } finally {
      setLoading(false); // ✅ Ensure this exists
    }
  };


const handleFirstQuestion = (answer) => {
  setIntendedAnswer(answer); // track the answer
  setStep(2); // move to next question
};

const handleStyleClick = async (answerType) => {
  setStyleAnswer(answerType);

  const needsEnhancement = intendedAnswer !== 'yes' || answerType !== 'similar';

  if (!needsEnhancement) {
    setFeedbackMessageW('Great! The article matches your intent and writing style.');
  } else {
    setFeedbackMessageW('Thanks! We will enhance the article to better match your intent and style.');

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const response = await fetch('http://127.0.0.1:8000/enhance-article/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article: articleContent, 
          userId: user.uid,
          feedback: {
            intended: intendedAnswer,
            style: answerType,
          },
        }),
      });

      const data = await response.json();
      if (!data.enhanced_article) throw new Error("No enhanced article received");

      // Update frontend
      setArticleContent(data.enhanced_article);

      // Optional: add a new version to chat
      setSelectedChat(prev => ({
        ...prev,
        versions: [data.enhanced_article, ...prev.versions],
      }));

    } catch (error) {
      console.error("Error enhancing article:", error);
      setIsLoading(false);
    }
  }

  setShowFeedback(true);
  setStep(3);

  setTimeout(() => {
    setShowFeedback(false);
  }, 4000);
};

// Wijdan's part

//const [tweetImages, setTweetImages] = useState([]);

/* useEffect(() => {
  if (selectedTopic && selectedTopic.trim() !== "") {
    console.log("📡 Fetching tweet images for topic:", selectedTopic);
    fetchTweetImages(selectedTopic); 
  }
}, [selectedTopic]);

const fetchTweetImages = async (topic) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/tweet-images/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    const data = await response.json();
    console.log("📸 Tweet image data from backend:", data);

    const allImages = data.tweets
      .flatMap((tweet) => tweet.image_urls || [])
      .filter((url, index, self) => self.indexOf(url) === index);

    setTweetImages(allImages);
  } catch (error) {
    console.error("Failed to fetch tweet images", error);
  }
}; 

  // Fetch images based on article content and title
  const fetchNewsImages = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/article-imagesNew/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTopic,   // or articleTitle if you have it separate
          content: articleContent // pass the actual article content here
        }),
      });

      const data = await response.json();
      console.log("🖼️ News Images:", data.images);
      setImages(data.images);
    } catch (error) {
      console.error("❌ Failed to fetch news images:", error);
    }
  };  
  
  const fetchUnsplashImages = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/unsplash-images/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTopic,
          content: articleContent,
        }),
      });

      const data = await response.json();
      console.log("🖼️ Unsplash Images:", data.images);
      setImages(data.images);
    } catch (error) {
      console.error("❌ Failed to fetch Unsplash images:", error);
    }
  }; 

  const fetchNewsImages = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/newsapi-images/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTopic,
          content: articleContent,
        }),
      });
  
      const data = await response.json();
      console.log("📰 NewsAPI Images:", data.images);
      setImages(data.images);
    } catch (error) {
      console.error("❌ Failed to fetch NewsAPI images:", error);
    }
  };
  
  */  

  const fetchNewsAPIImages = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/newsapi-images/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedTopic,        
          content: articleContent, 
        }),
      });
  
      const data = await response.json();
      console.log("🖼️ NewsAPI Images:", data.images);
      setImages(data.images); 
  
    } catch (error) {
      console.error("❌ Failed to fetch NewsAPI images:", error);
    }
  };

  const fetchSerpAPIImages = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/serpapi-images/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedTopic,
          content: articleContent,
        }),
      });
  
      const data = await response.json();
      console.log("🖼️ SerpAPI Images:", data.images);
      setImages(data.images);
  
    } catch (error) {
      console.error("❌ Failed to fetch SerpAPI images:", error);
    }
  };
  
  const handleAddImageClick = () => {
    setShowImagePicker(true);
    fetchSerpAPIImages  (); // Fetch images when button is clicked
  };

const [imagesInContent, setImagesInContent] = useState([]);
const [showOptions, setShowOptions] = useState(null);
const [imagesMap, setImagesMap] = useState({});


const insertImage = async (url) => {
  if (!selectedChat?.title) return;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Url = reader.result;

      setImagesMap(prev => {
        const currentImages = prev[selectedChat.title] || [];

        // Avoid duplicates
        if (currentImages.some(img => img.url === base64Url)) return prev;

        const updatedImages = [...currentImages, { url: base64Url, position: "right" }];
        
        // ✅ Move this call INSIDE the reader.onloadend block
        saveImageToFirestore(selectedChat.title, updatedImages);

        return {
          ...prev,
          [selectedChat.title]: updatedImages,
        };
      });
    };

    reader.readAsDataURL(blob);
  } catch (err) {
    console.error("❌ Failed to convert image to base64:", err);
  }
};

// Save function (call inside insertImage)
const saveImageToFirestore = async (title, updatedImages) => {
  const user = auth.currentUser;
  if (!user || !title) return;

  try {
    const userRef = doc(db, "Journalists", user.uid);
    const docSnap = await getDoc(userRef);
    const existing = docSnap.exists() ? docSnap.data() : {};

    const newExportedImages = {
      ...(existing.exportedImages || {}),
      [title]: updatedImages,
    };

    await updateDoc(userRef, { exportedImages: newExportedImages });
    console.log("✅ Image saved to Firestore immediately.");
  } catch (error) {
    console.error("❌ Failed to save image to Firestore:", error);
  }
};


  // Toggle image options (three dots)
  const toggleImageOptions = (index) => {
    setShowOptions(showOptions === index ? null : index); // Toggle between showing or hiding options
  };

  // Change image position (left, right, center, up, down)
  const changeImagePosition = (index, position) => {
    setImagesMap(prev => {
      if (!selectedChat) return prev;
      const currentImages = prev[selectedChat.title] || [];
      const updatedImages = [...currentImages];
      if (position === "up" || position === "down") {
        const [movedImage] = updatedImages.splice(index, 1);
        const newIndex = position === "up" ? index - 1 : index + 1;
        updatedImages.splice(newIndex, 0, movedImage);
      } else {
        updatedImages[index].position = position;
      }
      return {
        ...prev,
        [selectedChat.title]: updatedImages
      };
    });
  };
  

  // Remove image from content
  const handleRemoveImage = (index) => {
    setImagesMap(prev => {
      const currentImages = prev[selectedChat.title] || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);
      return {
        ...prev,
        [selectedChat.title]: updatedImages
      };
    });
  };
  


  return (
    <div
      className={`homepage-containerH ${isSidebarOpen ? "sidebar-open" : ""}`}
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      
    >
      {showFeedback && (
        <>
          <div className="modal-backdrop" />
          <FeedbackModal onComplete={handleFeedbackComplete} />
        </>
      )}
      <div className="sidebarH" onClick={(e) => e.stopPropagation()} >
       <button className="new-chat-btnH" onClick={wrappedNewChat}>
          + New chat
        </button>

        
        <div className="chatsH">
        {chats.map((chat, index) => (
  <div key={index} className="chat-item-with-buttons">
    <button
      className="chat-btnH"
      onClick={() => handleChatClick(chat)}
    >
      {chat.title}
    </button>

  <div className="chat-actions">
    <button 
      className="dots-btn" 
      onClick={(event) => handleDotsClick(event, index)}
      >
      ⋮
    </button>

    {openDropdownIndex === index && (
  <div className="dropdown-menu" style={{ top: dropdownPosition.top, left: dropdownPosition.left = 138, position: 'fixed' }}>
    <button
      onClick={() => {
        handleEditClick(chat);
        setOpenDropdownIndex(null); // ✅ Close the box after click
      }}
    >
      Edit
    </button>
    <button
      onClick={() => {
        handleDeleteClick(chat);
        setOpenDropdownIndex(null); // ✅ Close the box after click
      }}
    >
      Delete
    </button>
  </div>
)}

  </div>
  </div>
))}

        </div>
      </div>

      <div className="main-contentH">
        <div className="navbarH">
          <div className="logo-sectionH">
            <button
              className="menu-btnH"
              onClick={(e) => {
                e.stopPropagation(); // Prevent closing sidebar on button click
                toggleSidebar();
              }}
            >
              ☰
            </button>
            <img src={logo} alt="Logo" className="logoH" />

          </div>
          <div className="profile-sectionH">
            <div className="welcome-sectionH">
            <h6 className="welcome-headingH">Good morning, {userData?.title ? `${userData.title} ${userData.firstName} ${userData.lastName}` : journalistName}</h6>
              <p className="welcome-subtextH">Let’s dive into the latest!</p>
            </div>
            <div className="profile-linkH" onClick={handleProfileClick}>
              <img
                src={ProfileIcon}
                alt="Profile Icon"
                className="ProfileIconH"
              />
              {showTooltip && userData && (
                <div className="profile-tooltipH">
                  <h2>{`${userData.title} ${userData.firstName} ${userData.lastName}`}</h2>
                  <p>
                    <strong>Email:</strong> {userData.email}
                  </p>
                  <p>
                    <strong>Affiliation:</strong> {userData.affiliation}
                  </p>
                  <p>
                    <strong>Country:</strong> {userData.country}
                  </p>
                  <button
                    className="view-profile-btnH"
                    onClick={handleEditProfile}
                  >
                    View Profile
                  </button>

                   <div className="sidebar-footerH">
                    <button className="mode-btnH" onClick={toggleDarkMode}>
                      {isDarkMode ? (
                        <>
                       <img src={sunIcon} alt="Sun Icon" className="iconH" /> Light
                      Mode
                        </>
                        ) : (
                        <>
                       <img src={moonIcon} alt="Moon Icon" className="iconH" /> Dark
                      Mode
                       </>
                          )}
                   </button>
                     <button className="logout-btnH" onClick={handleLogout}>
                     <img src={exitIcon} alt="Exit Icon" className="iconH" /> Log out
                   </button>
                    </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {!loading && !isArticleGenerated && (
  <div className="topics-sectionH">
    <h2 className="section-title">Stay Informed: What’s Happening Around the World </h2>
    {isLoadingTopics ? (
      <p className="loading-text">Loading topics...</p>
    ) : Object.keys(topicArticles).length > 0 ? (
      <div className="topics-containerH">
        {Object.entries(topicArticles)
          .slice(0, 10)
          .map(([topicName, articles]) => {
            if (!articles || articles.length === 0) return null;
            const article = articles[0];
            if (!article || (!article.summary && !article.title)) return null;

            return (
              <div
                key={article.title}
                className="topic-cardH"
                onClick={() => handleResourceClick(article)}
                style={{ cursor: "pointer" }}
              >
                <h1 className="article-title">{article.title || topicName}</h1>
                <p className="article-description">
                  {article.summary ? article.summary.slice(0, 180) + "..." : "No description available."}
                </p>
                {article.sources && article.sources.length > 0 && (
                  <div className="source-badges">
                    <span style={{ fontWeight: "bold" }}>Sources:</span>{" "}
                    {article.sources.map((src, index) => {
                      const domain = extractDomain(src.url);
                      return (
                        <a
                          key={index}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-logo"
                          title={src.source}
                        >
                          <img
                            src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`}
                            alt={src.source}
                            className="source-icon"
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    ) : (
      <p className="no-topics">No topics found</p>
    )}
    <p className="topic-promptH">Don’t see a topic you’re interested in? Try searching for it instead</p>
  </div>
)}

<div className="input-field-container">
  <div className="input-field-wrapper">
    <input
      type="text"
      placeholder={
        isArticleGenerated
          ? "Change on the article" // After generation
          : "Enter your topic here..." // Default
      }
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      className="input-field"
    />
    <button className="keyword-button" onClick={() => setShowKeywordPopup(true)}>
      Keyword
    </button>
    {isLoading || loading ? (
  <>
    
  </>
) : (
  <button className="send-btns"
        onClick={async () => {
          if (!topic.trim()) {
            setTopicError("Please enter your changes.");
            return;
          }

          if (!selectedChat) {
            // Generating a completely new article
            handleGenerateArticle(topic, keyword);
          } else {
            // Updating the existing article version with AI changes
            setIsLoading(true);
            try {
              const user = auth.currentUser;
              if (!user) throw new Error("User not authenticated");

              const updatePrompt = `Modify the following article based on these instructions: ${topic}. 

              Article: ${articleContent}`;

              const response = await fetch("http://127.0.0.1:8000/generate-article/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  prompt: updatePrompt,
                  user_id: user.uid,
                  keywords: keyword,
                }),
              });

              if (!response.ok) throw new Error("AI article update failed");

              const aiData = await response.json();

              if (!aiData || !aiData.article) throw new Error("Invalid response from AI");

              // Add new version
              const updatedChat = {
                ...selectedChat,
                versions: [aiData.article, ...selectedChat.versions],
              };

              // Update chats state
              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat === selectedChat ? updatedChat : chat
                )
              );

              // Update currently viewed version
              setSelectedChat(updatedChat);
              setCurrentVersionIndex(0);
              setArticleContent(aiData.article);
            } catch (error) {
              console.error("❌ Error updating article:", error);
              setTopicError("Failed to apply changes. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }

          setTopic(""); // Clear input after processing
        }}
      >
        <img src={sendIcon} alt="Send Icon" className="send-icon" />
      </button>
    )}
  </div>
  
</div>




        {showKeywordPopup && (
          <div className="keyword-popup">
            <textarea
              placeholder="Enter keywords separated by commas to describe your topic...&#10;For example: Saudi arabia, Vision 2023"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            ></textarea>  
                        <div className='exclamation_mark_div2'>
{isDarkMode ? (
    <img 
      src={whiteExclamationMark} 
      alt="Exclamation Mark" 
      className="exclamation_mark_black" 
    />
  ) : (
    <img 
      src={exclamation_mark} 
      alt="Exclamation Mark" 
      className="exclamation_mark_white" 
    />
  )}Add keywords to help us find and recognize your topic easily
</div>         
            <button onClick={() => setShowKeywordPopup(false)}>Save</button>

          </div>
        )}

{isLoading || loading ? (
  <>
  <p className="loading-text">Generating your article...</p>
</>
) : isArticleGenerated && selectedChat ? (
  <>
    <div className="generated-articleH">
      <h3 className="article-titleH">
        {isEditing ? (
          <input
            type="text"
            value={selectedChat?.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="title-edit-input"
          />
        ) : (
          selectedChat?.title
        )}
      </h3>

      <p className="article-timestampH">{selectedChat?.timestamp}</p>


              {isEditing ? (
        <>
          <textarea
            className="article-contentH"
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
            style={{
              height: "600px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          />
          {/* Edit Mode - Display Images with Controls */}
          <div className="editing-images-wrapper">
          {(imagesMap[selectedChat.title] || []).map((imgObj, index) => (
              <div key={index} className="editing-image-item">
                <img src={imgObj.url} alt={`Inserted ${index}`} />
                <button
                  className="delete-image-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="article-preview">
          {/* Display Images with Three Dots */}
          {(imagesMap[selectedChat.title] || []).map((imgObj, index) => (
  <div key={index} className={`preview-image-item ${imgObj.position}`}>
    <img src={imgObj.url} alt={`Inserted ${index}`} />

              {/* Three Dots Button */}
              <button className="options-btn" onClick={() => toggleImageOptions(index)}>
                ⋮
              </button>

              {/* Image Options Menu */}
              {showOptions === index && (
                <div className="image-options-menu">
                  <button onClick={() => changeImagePosition(index, "left")}>Move Left</button>
                  <button onClick={() => changeImagePosition(index, "center")}>Move Center</button>
                  <button onClick={() => changeImagePosition(index, "right")}>Move Right</button>
                  <button className="delete-btn"
  onClick={() => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      handleRemoveImage(index);
    }
  }}
  style={{ color: 'red', fontWeight: 'bold' }}
>
  Delete Image
</button>

                </div>
              )}
            </div>
          ))}
          {/* Display Text Content */}
          <p
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              marginTop: "20px",
            }}
          >
            {articleContent}
          </p>
</div>
)}                              
              <div className="article-actionsH">
                {isEditing ? (
                  <button className="save-btnH" onClick={handleSave}>
                    Save
                  </button>
                ) : (
                  <button className="edit-btnH" onClick={() => setIsEditing(true)}>
                  < img src={edit} alt="Edit" className="button-icon" />
                 </button>
                  
                )}
                
                 
                
 
                
<button className="export-btnH" onClick={wrappedExport}>
  <img src={Export} alt="Export" className="button-icon" />
</button>

                <button className="img-btnW" onClick={handleAddImageClick}>
                 <img src={AddImage} alt="Add Image" />
                </button>

{showImagePicker && (
  <div className="tweet-image-picker">
    {images.map((url, index) => (
      <img
        key={index}
        src={url}
        alt="News API"
        onClick={() => insertImage(url)}
        className="img-thumb"
      />
    ))}

<div className="upload-own-image">
  <p>Or you can upload your own image:</p>
  <label htmlFor="file-upload" className="upload-icon">
    Upload 📷
  </label>
  <input
    id="file-upload"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result;
          insertImage(imageUrl); 
          setShowImagePicker(false); 
        };
        reader.readAsDataURL(file);
      }
    }}
  />
</div>

    <button onClick={() => setShowImagePicker(false)} className="close-picker-btn">
      Close
    </button>
                 </div>
               )}

                <button
                  className="backward-btn"
                  onClick={handleBackward}
                  disabled={currentVersionIndex === 0}
                >
                  <img src={Backward} alt="Backward" />
                </button>
                <button
                  className="forward-btn"
                  onClick={handleForward}
                  disabled={!selectedChat || currentVersionIndex >= selectedChat.versions.length - 1}
                >
                  <img src={forward} alt="Forward" />
                </button>
                
               
              </div>
               </div>

          </>
        ) : null}

        {isProfileEditing && (
          <EditProfile
            userData={userData}
            onClose={() => setIsProfileEditing(false)}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;

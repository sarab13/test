import React, { useState, useEffect } from "react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useNavigate } from "react-router-dom"

function App() {
  const navigate = useNavigate()
  const [timer, setTimer] = useState(300000)
  const [isDark,setIsDark]=useState(window.matchMedia("(prefers-color-scheme: dark)").matches)
  
  const [cards, setCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [newCard, setNewCard] = useState({
    _id: false,
    question: "",
    answer: "",
    picture: "",
  })


const [isRemaining,setIsRemaining]=useState(false)
useEffect(() => {
    // Update network status
    const handleStatusChange = () => {
      if(navigator.onLine && isRemaining)
      SyncWithDB()
    };

    // Listen to the online status
    window.addEventListener('online', handleStatusChange);

    // Listen to the offline status
    window.addEventListener('offline', handleStatusChange);

    // Specify how to clean up after this effect for performance improvment
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
}, [navigator.onLine]);




  const getCards = async () => {
  
    setCards(JSON.parse(localStorage.getItem("cards")))
    setFilteredCards(JSON.parse(localStorage.getItem("cards")))
  }

  const initialLoad = async () => {
    try {
      const token = localStorage.getItem("token")
      const data = await axios.get("/cards", {
        headers: {
          authorization: token,
        },
      })
      if (!data.data.error) {
        localStorage.setItem("cards", JSON.stringify(data.data.cards))
        setCards(data.data.cards)
        setFilteredCards(data.data.cards)
      } else {
        toast(data.data.error, {
          position: toast.POSITION.BOTTOM_RIGHT,
        })
        navigate("/login")
      }
    } catch (e) {
      toast("Something went wrong!", {
        position: toast.POSITION.BOTTOM_RIGHT,
      })
      initialLoad()
    }
  }

  const SyncWithDB = async () => {
    try {
      setIsRemaining(false)
      const cards = JSON.parse(localStorage.getItem("cards"))
      const token = localStorage.getItem("token")
      const result = await axios.post(
        "/syncdata",
        { cards },
        {
          headers: {
            authorization: token,
          },
        }
      )
      if (!result.data.error) {
        toast("Successfully Synchronize data!", {
          position: toast.POSITION.BOTTOM_RIGHT,
        })
        initialLoad()
      } else {
        toast("Error while  Synchronizing data!", {
          position: toast.POSITION.BOTTOM_RIGHT,
        })
        navigate("/login")
      }
    } catch (e) {
      toast("Something went wrong while syncing data with db!", {
        position: toast.POSITION.BOTTOM_RIGHT,
      })
      getCards()
    }
  }
  useEffect(() => {
    initialLoad()
  }, [])


  useEffect(() => {
    const interval = setInterval(() => {
      if(navigator.onLine){
      SyncWithDB()
        }
      else
      setIsRemaining(true)
    }, timer)

    return () => clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [timer])

  const clearContents = () => {
    setNewCard({
      _id: false,
      question: "",
      answer: "",
      picture: "",
    })
  }

  const handlePopup = () => {
    clearContents()
    document.querySelector("#popup-box").style.display = "block"
  }
  const handleClosePopup = () => {
    document.querySelector("#popup-box").style.display = "none"
  }

  const handleDelete = async (index) => {
    try {
      let ncardsArray = cards.filter((item, ind) => ind !== index)
      setCards(ncardsArray)
      setFilteredCards(ncardsArray)
      localStorage.setItem("cards", JSON.stringify(ncardsArray))
      // await axios.delete(`/card?_id=${_id}`)
      toast("Card Delete Successfully", {
        position: toast.POSITION.BOTTOM_RIGHT,
      })
      getCards()
    } catch (e) {
      toast("Something went wrong!", {
        position: toast.POSITION.BOTTOM_RIGHT,
      })
      getCards()
    }
  }

  const handleEdit = (item) => {
    document.querySelector("#popup-box").style.display = "block"
    setNewCard({
      _id: item._id,
      question: item.question,
      answer: item.answer,
    })
  }

  const filterBySearch = (event) => {
    const query = event.target.value
    if (query === "") {
      setFilteredCards(cards)
      return
    }
    var updatedList = [...filteredCards]
    updatedList = cards.filter((item) =>
      item.question.toLowerCase().startsWith(query.toLowerCase())
    )
    setFilteredCards(updatedList)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    document.querySelector("#popup-box").style.display = "none"
    const formData = new FormData()
    formData.append("question", newCard.question)
    formData.append("answer", newCard.answer)
    formData.append("picture", "")
    if (!newCard._id) {
      try {
        let r = (Math.random() + Date.now()).toString(36).substring(2)
        setNewCard({ ...newCard, _id: "000" + r })
        setCards([...cards, newCard])
  
        localStorage.setItem("cards", JSON.stringify([...cards, newCard]))
        toast("Card Added Successfully", {
          position: toast.POSITION.BOTTOM_RIGHT,
        })
        getCards()
      } catch (e) {
        toast("Something went wrong!", {
          position: toast.POSITION.BOTTOM_RIGHT,
        })
        getCards()
      }
    } else {
      formData.append("_id", newCard._id)
      try {
        let cardsArray = cards
        for (let i = 0; i < cardsArray.length; i++) {
          if (cardsArray[i]._id == newCard._id) {
            cardsArray[i] = newCard
            break
          }
        }
        localStorage.setItem("cards", JSON.stringify(cardsArray))

        //await axios.put('/card',{question:newCard.question,
        //answer:newCard.answer,
        //_id:newCard._id
        //})

        toast("Card Updated Successfully", {
          position: toast.POSITION.BOTTOM_RIGHT,
        })
        getCards()
      } catch (e) {
        toast("Something went wrong!", {
          position: toast.POSITION.BOTTOM_RIGHT,
        })
        getCards()
      }
    }
  }
  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }
  return (
    <div className={`${isDark?'dark':'light'} main-container`}>
      
      <div id="search-container" className={`${isDark?'dark':'light'}`}>
        <ToastContainer />
        <input
          type="text"
          placeholder="Search"
          onChange={filterBySearch}
          id="search-box"
        />
        <button id={`${isDark?'button-dark':'button-light'}`} onClick={handlePopup}>
          Add
        </button>
        <div className="timer">
      
          <label style={isDark?{color:'white'}:{color:'black'}}>Sync after:</label>
          <select
            defaultValue={timer}
            onChange={(e) => setTimer(e.target.value)}
          
          
          >
            <option value={300000}>5 minutes</option>
            <option value={3600000}>1 hour</option>
            <option value={86400000}>1 day</option>
          </select>
        </div>
        <div className="timer">
          <label style={isDark?{color:'white'}:{color:'black'}}>Mode:</label>
          <select
            defaultValue="default"
            onChange={(e) =>{
              if(e.target.value=='default')
              setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
              else{
                setIsDark(!window.matchMedia("(prefers-color-scheme: dark)").matches)
              }
            }}
            
            
          >
            <option value="custom">{window.matchMedia("(prefers-color-scheme: dark)").matches?'light':'Dark'}</option>

            <option value="default">default</option>
          </select>
        </div>
        <button id={`${isDark?'button-dark':'button-light'}`} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={`App ${isDark?'dark':'light'}`}>
        {filteredCards &&
          filteredCards.map((item, index) => (
            <div key={index} className="card">
              <button onClick={() => handleDelete(index)}>Delete</button>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <br />

              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </div>
          ))}
      </div>
      <div id="popup-box" className="popup-modal">
        <div className="popup-content">
          <span onClick={handleClosePopup} className="close">
            &times;
          </span>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Question:</label>
              <input
                type="text"
                value={newCard.question}
                onChange={(e) =>
                  setNewCard({ ...newCard, question: e.target.value })
                }
                id="title"
                name="title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Answer:</label>
              <textarea
                id="description"
                value={newCard.answer}
                onChange={(e) =>
                  setNewCard({ ...newCard, answer: e.target.value })
                }
                name="description"
              ></textarea>
            </div>

            <input
              type="submit"
              value={newCard._id ? "Update" : "Create"}
              className="btn btn-primary"
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default App

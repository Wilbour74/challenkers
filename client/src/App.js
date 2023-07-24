import React, {useEffect, useState} from "react";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.css';
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import CitationForm from "./components/add-citation";

function App() {
  const [citations, setCitations] = useState([]);
  const [CurrentCitation, setCurrentCitation] = useState([]);
  const [author, setAuthor] = useState([]);
  const [Episode, setEpisode] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isCrudButton1, setIsCrudButton1] = useState(false);
  const [modif, setmodif] = useState(false);
  const [modifCitation, setmodifCitation] = useState({});
  const [textvalue, setTextvalue] = useState("");
  const [allCitations, setAllCitations] = useState([]);

  const handleCrudButtonClick = () => {
    if (showForm) {
      setShowForm(false);
      setIsCrudButton1(false);
    } else {
      setShowForm(true);
      setIsCrudButton1(true);
    }
  };

  const modifonclick = (citationId) => {
    setmodif((prevState) => ({
      ...prevState,
      [citationId]: !prevState[citationId]
    }));

    setmodifCitation((prevState) => ({
      ...prevState,
      [citationId]: citations.find((citation) => citation.id === citationId)?.citation || "",
    }));
  };

  useEffect(() => {
    fetchCitations(); 
    fetchApiCitations();
  }, []);

  const fetchCitations = () => {
    axios.get("http://localhost:8000/api/citations")
    .then(response => {
      setAllCitations(response.data);
      setCitations(response.data);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });

    
  }

  const fetchApiCitations = () =>{
    axios.get("http://localhost:8000/api/random")
    .then(response => {
      
      setCurrentCitation(response.data.citation.citation);
      setAuthor(response.data.citation.infos.auteur);
      setEpisode(response.data.citation.infos.episode);
      setIsFavorite(false);
     
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
  }

  const fetchRandomCitation = () => {
      axios.get("http://localhost:8000/citation/random")
      .then(response => {
        console.log(response.data);
        setCurrentCitation(response.data[0].citation)
        setAuthor(response.data[0].author)
        setEpisode("Challenkers")
        
      })

      .catch(error => {
        console.error("Error fetching data", error);
      })
  } 


  const addToFav = () => {
    axios.post("http://localhost:8000/favoris/create", { episode: Episode, citation: CurrentCitation, auteur: author})
    .then((response) => {
      console.log(response.data);
      setIsFavorite(true);
    })

    .catch((error) => {
      console.error(error);
    })
  }

  const removeFromFav = () => {
    axios.post("http://localhost:8000/favoris/delete", { episode: Episode, citation: CurrentCitation, auteur: author})
    .then((response) => {
      console.log(response.data);
      setIsFavorite(false);
    })

    .catch((error) => {
      console.error(error);
    })
  }

  const deletecitation = (citationId) => {
    axios.post("http://localhost:8000/citation/delete", { id: citationId})
    .then((response) => {
      console.log(response.data);
      fetchCitations(); 
    })

    .catch((error) => {
      console.error(error);
    })
  }

  const modifcitation = (updateCitation, citationId) => {
    axios.post("http://localhost:8000/citation/update", { id: citationId, citation: { citation: updateCitation } })
    .then((response) => {
      console.log(response.data);
      fetchCitations();
      setmodif((prevState) => ({
        ...prevState,
        [citationId]: false,
      }));
      
      setmodifCitation((prevCitations) => ({
        ...prevCitations,
        [citationId]: updateCitation,
      }));
    })
  

    .catch((error) => {
      console.error(error)
    })
    
  }

  const recherche = (event) => {
    const value = event.target.value;
    setTextvalue(value);
    axios.post("http://localhost:8000/citation/recherche", {value : textvalue})
    .then((response) => {
      const filteredCitations = allCitations.filter((citation) =>
    citation.citation.toLowerCase().includes(value.toLowerCase())
  );

  setCitations(filteredCitations);
    })

    .catch((error) => {
      console.error(error)
    })
  }

 
  
  return (
    <div className="App">
  
      <h1 className="custom-h1">Citations</h1>
      <div className="citation">
        <h4 className="custom-h2">{CurrentCitation}</h4>
        <h5 className="custom-h3">{author}</h5>
        <div className="fav">
          {isFavorite ? (
            <button className="test" onClick={removeFromFav}>
            <h6 className="custom-h4"><i class="fa-regular fa-star"></i>Retirer de tes favoris</h6>
          </button>
          ): (
        <button className="test" onClick={addToFav}>
          <h6 className="custom-h4"><i class="fa-regular fa-star"></i>Mettre en favoris</h6>
        </button>
        )}
        </div>
      </div>
    
      <h5 className="custom-h5">Afficher une autre citation</h5>
      
      <div className="button">
        <button className="search" onClick={fetchRandomCitation}>
          <h6 className="boite"><i class="fa-solid fa-eye"></i>Parmis mes citations</h6>
        </button>


        <button className="search1" onClick={fetchApiCitations}>
          <h6 className="boite"><i class="fa-solid fa-eye"></i>Parmis les citations de Kaamelot</h6>
        </button>
      </div>
      <hr className="hr"></hr>

      <h2 className="custom-h7">Mes citations</h2>
      <div className="CRUD">
  <div className="crud">
     
  <button
          type="submit"
          placeholder="Ajouter une citation"
          className={`crud-button ${isCrudButton1 ? "crud-button1" : ""}`}
          onClick={handleCrudButtonClick}
        >
          <span className="plus">&#65291;</span> Ajouter une citation
        </button>
    

    <div className="recherche">
    
    <input
      type="text"
      name="recherche"
      className="recherche-input"
      placeholder="Rechercher dans mes citations"
      onChange={recherche}
    />
    <i className="fa-solid fa-magnifying-glass search-icon fa-fade"></i>
     
  </div>

  
  </div>
</div>
{showForm && <CitationForm onCitationAdded={fetchCitations} />}
<hr className="hr"></hr>

<div className="sqlcitation">
        {citations.map((citation) => (
          <div key={citation.id} className="citation-item">
           {!modif[citation.id] ? (
          <p className="p">
        {citation.citation}
        <span className="button-group">
          <button className="poubelle" onClick={() => deletecitation(citation.id)}>
            <i className="fas fa-trash"></i>
          </button>
          <button className="crayon" onClick={() => modifonclick(citation.id)} >
            <i className="fas fa-pencil-alt"></i>
          </button>
        </span>
      </p>
      ) : (
        <div className="modif-button">
        <input
      type="text"
    value={modifCitation[citation.id] !== undefined ? modifCitation[citation.id] : citation.citation}
    className="ajout1"
    onChange={(event) => {
      const newValue = event.target.value;
    setmodifCitation((prevState) => ({
      ...prevState,
      [citation.id]: newValue,
    }));
    }}
/>
        <button onClick={() => modifcitation(modifCitation, citation.id)} className="crud-button">Sauvegarder</button>
        </div>
      )
      }
          <hr className="hr1 hr-horizontal" />
        </div>
      ))}
    </div>
</div>
);
}

export default App;


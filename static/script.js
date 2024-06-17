let originalSongList = [];
generateSetlistURL();

async function fetchAndProcessCSV() {
    const response = await fetch('/static/songs.csv'); // Updated fetch URL
    const data = await response.text();
    originalSongList = data.split('\n').slice(1).map(line => {
        const [title, artist] = line.split(',');
        return { title, artist };
    });
    displayRandomLine();
    loadSongList();
    sendrandom();
    
}

function sendrandom() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/receive_variable');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({song: song, artist: artist}));
}

function displayRandomLine() {
    const randomLineIndex = Math.floor(Math.random() * originalSongList.length);
    const randomSong = originalSongList[randomLineIndex];
    const loadingLink = document.getElementById('loadingLink');
    loadingLink.style.display = 'inline';
    loadingLink.textContent = `${randomSong.title} - ${randomSong.artist}`;
    loadingLink.onclick = () => openLyricsSite(randomSong.title, randomSong.artist);
}




function showSongList() {
    document.getElementById("songListPopup").style.display = "block";
    generateSetlistURL()
}

function closeSongListPopup() {
    document.getElementById("songListPopup").style.display = "none";
}

function loadSongList() {
    const songList = document.getElementById("songList");
    songList.innerHTML = '';

    originalSongList.forEach((song, index) => {
        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `checkbox-${index}`;
        listItem.appendChild(checkbox);
        listItem.innerHTML += `${index + 1}. ${song.title} - ${song.artist}`;
        songList.appendChild(listItem);
    });
}

// Function to parse setlist data from the URL
function parseSetlistFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const setlistParam = urlParams.get('setlist');
    if (setlistParam) {
        const decodedSetlist = decodeURIComponent(setlistParam);
        displaySetlistFromData(decodedSetlist);
    }
}

// Function to display setlist from data
function displaySetlistFromData(setlistData) {
    const setlistContent = document.getElementById('setlistContent');
    let setlistHTML = '<h2>Setlist</h2><ul>';
    setlistHTML += setlistData; // Assume setlistData is formatted correctly
    setlistHTML += '</ul>';
    setlistContent.innerHTML = setlistHTML;
    document.getElementById('setlistPopup').style.display = 'block';
}

function addToSetlist(song) {
    let selectedSongs = JSON.parse(localStorage.getItem('selectedSongs')) || [];
    selectedSongs.push(song);
    localStorage.setItem('selectedSongs', JSON.stringify(selectedSongs));
    generateSetlistURL()
}

function dashset(songInfo) {
    let [title, artist] = songInfo.split(/\s*-\s*/);
    let selectedSongs = JSON.parse(localStorage.getItem('selectedSongs')) || [];
    selectedSongs.push({ title, artist });
    localStorage.setItem('selectedSongs', JSON.stringify(selectedSongs));
    generateSetlistURL();
}


function removeFromSetlist(song) {
    let selectedSongs = JSON.parse(localStorage.getItem('selectedSongs')) || [];
    selectedSongs = selectedSongs.filter(selectedSong => selectedSong.title !== song.title || selectedSong.artist !== song.artist);
    localStorage.setItem('selectedSongs', JSON.stringify(selectedSongs));
}


// Call the function to parse setlist data from the URL when the page loads
window.onload = parseSetlistFromURL;


function filterSongList(searchInput) {
    searchInput = searchInput.trim().toLowerCase();
    if (searchInput === '') {
        loadSongList();
        return;
    }

    const filteredSongs = originalSongList.filter(song =>
        song.title.toLowerCase().includes(searchInput) || // Check if title matches search input
        song.artist.toLowerCase().includes(searchInput) // Check if artist matches search input
    );

    const songList = document.getElementById("songList");
    songList.innerHTML = '';

    if (filteredSongs.length > 0) {
        filteredSongs.forEach((song, index) => {
            const listItem = document.createElement("li");
            const checkbox = document.createElement("input");
            listItem.id = 'filteredsonginfo';
            checkbox.type = "checkbox";
            checkbox.id = `checkbox-${index}`;

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    addToSetlist(song);
                }
            });

            listItem.appendChild(checkbox);

            const textSpan = document.createElement("span");
            textSpan.innerHTML = `${index + 1}. ${song.title} - ${song.artist}`;

            textSpan.addEventListener('click', () => openLyricsSite(song.title, song.artist));

            listItem.appendChild(textSpan);
            songList.appendChild(listItem);
        });

        
    } else {
        const listItem = document.createElement("li");
        listItem.textContent = "Click enter to search further...";
        songList.appendChild(listItem);
    }
}


// Update the function for displaying song by ID to call addToSetlist
function displaySongById(songId) {
    const songIndex = songId - 1;
    const song = originalSongList[songIndex];
    if (song) {
        addToSetlist(song);
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title)}+${encodeURIComponent(song.artist)}`;
        const loadingLink = document.getElementById('loadingLink');
        loadingLink.style.display = 'inline';
        loadingLink.href = youtubeSearchUrl;
        loadingLink.textContent = `${song.title} - ${song.artist}`;
        document.getElementById('songList').innerHTML = `<li>${songId}. ${song.title} - ${song.artist}</li>`;
    } else {
        alert("Invalid song ID. Please enter a number between 1 and " + originalSongList.length);
        loadSongList();
    }
}



function displaySongsByArtist(artistName) {
    const filteredSongs = originalSongList.filter(song =>
        song.artist.toLowerCase().includes(artistName)
    );

    const songList = document.getElementById("songList");
    songList.innerHTML = '';

    if (filteredSongs.length > 0) {
        filteredSongs.forEach((song, index) => {
            const listItem = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `checkbox-${index}`;

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    addToSetlist(song);
                }
            });

            listItem.appendChild(checkbox);

            const textSpan = document.createElement("span");
            textSpan.innerHTML = `${index + 1}. ${song.title} - ${song.artist}`;

            textSpan.addEventListener('click', () => openLyricsSite(song.title, song.artist));

            listItem.appendChild(textSpan);
            songList.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement("li");
        listItem.textContent = "No matching artist found.";
        songList.appendChild(listItem);
    }
}


// Update the search input event listener to call addToSetlist
document.getElementById('searchInput').addEventListener('input', function(event) {
    const searchInput = event.target.value;
    filterSongList(searchInput);
    // Add the selected song to the setlist
    const songId = parseInt(searchInput);
    if (!isNaN(songId) && songId >= 1 && songId <= originalSongList.length) {
        displaySongById(songId);
    }
});

// Function to store selected songs in local storage
function storeSelectedSongs() {
    const selectedSongs = [];
    originalSongList.forEach((song, index) => {
        const checkbox = document.getElementById(`checkbox-${index}`);
        if (checkbox.checked) {
            selectedSongs.push(song);
        }
    });
    localStorage.setItem('selectedSongs', JSON.stringify(selectedSongs));
}

// Listen for changes in checkboxes and store selected songs
document.getElementById('songList').addEventListener('change', storeSelectedSongs);



// Retrieve selected songs from local storage and display them in a popup
function displaySetlist() {
    const selectedSongs = JSON.parse(localStorage.getItem('selectedSongs'));
    const setlistPopup = document.getElementById('setlistPopup');
    const setlistContent = document.getElementById('setlistContent');

    if (selectedSongs && selectedSongs.length > 0) {
        let setlistHTML = '<h2>Setlist</h2><ul>';
        selectedSongs.forEach((song, index) => {
            const songId = `song-${index}`;
            setlistHTML += `<li id="${songId}">${index + 1}. ${song.title} - ${song.artist}</li> 
            <button onclick="deleteSong(${index})"class="delete-button"><i class="fas fa-trash-alt"></i></button>`;
        });
        setlistHTML += '</ul>';
        setlistContent.innerHTML = setlistHTML;
        setlistPopup.style.display = 'block';
        
        selectedSongs.forEach((song, index) => {
            const songId = `song-${index}`;
            const songElement = document.getElementById(songId);
            songElement.addEventListener('click', () => openLyricsSite(song.title, song.artist));
        });
    } else {
        setlistContent.innerHTML = "No songs selected yet!";
        setlistPopup.style.display = 'block';
    }
}

// Close setlist popup
function closeSetlistPopup() {
    document.getElementById("setlistPopup").style.display = "none";
}

function closeSetlistPopup2() {
    document.getElementById("setlistPopup2").style.display = "none";
}


// Delete a song from the setlist
function deleteSong(index) {
    event.stopPropagation();
    let selectedSongs = JSON.parse(localStorage.getItem('selectedSongs'));
    selectedSongs.splice(index, 1);
    localStorage.setItem('selectedSongs', JSON.stringify(selectedSongs));
    displaySetlist();
}

// Clear the entire setlist
function clearSetlist() {
    localStorage.removeItem('selectedSongs');
    displaySetlist();
}

// Function to generate a shareable URL for the setlist
function generateSetlistURL() {
    const selectedSongs = JSON.parse(localStorage.getItem('selectedSongs'));
    if (selectedSongs && selectedSongs.length > 0) {
        const encodedSetlist = encodeURIComponent(JSON.stringify(selectedSongs));
        const currentURL = window.location.href.split('?')[0]; // Remove existing query parameters if any
        const setlistURL = `${currentURL}?setlist=${encodedSetlist}`;
        localStorage.setItem("setlist", setlistURL);
        return setlistURL;
    }
    return null;
}


var loc = location.href

let songsShared = [];
let artistsShared = [];

function displaySetlistFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const setlistParam = urlParams.get('setlist');
    if (setlistParam) {

        


        const SSetlist = JSON.parse(decodeURIComponent(setlistParam));
        const setlistPopup = document.getElementById('setlistPopup2');
        const setlistContent = document.getElementById('setlistContent2');
        let setlistHTML = '<h2>Shared Setlist</h2><ul>';
        SSetlist.forEach((song, index) => {
            setlistHTML += `<li>${index + 1}. ${song.title} - ${song.artist}</li>`;
            songsShared.push(song.title)
            artistsShared.push(song.artist)
        });

        setlistHTML += '</ul>';
        setlistContent.innerHTML = setlistHTML;
        setlistPopup.style.display = 'block';
        const listItems = setlistContent.querySelectorAll('li');
        listItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const selectedSong = SSetlist[index];
                openLyricsSite(selectedSong.title, selectedSong.artist);
            });
        });

        const loc = location.href;
        localStorage.setItem("url", loc);
        
        
    }
}


// Call the function to display setlist from URL when the page loads
window.onload = displaySetlistFromURL();

// Delete a song from the setlist
function deleteSong(index) {
    let selectedSongs = JSON.parse(localStorage.getItem('selectedSongs'));
    selectedSongs.splice(index, 1);
    localStorage.setItem('selectedSongs', JSON.stringify(selectedSongs));
    displaySetlist();
}

// Clear the entire setlist
function clearSetlist() {
    localStorage.removeItem('selectedSongs');
    displaySetlist();
}

$(function() {
    generateSetlistURL();
    var currentUrl = localStorage.getItem("setlist");

    const URLSend = {
        setlistURL: currentUrl
    };

    fetch('/URL_Data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(URLSend)
    })
    .then(response => response.json())
    .then(data => {
        var shortenedUrl = data.shortenedURL;
        console.log('Shortened URL:', shortenedUrl);

        var clipboard = new Clipboard('#copyButton', {
            text: function() {
                return shortenedUrl; 
            }
        });
    
        clipboard.on('success', function(e) {
            alert('Text copied to clipboard successfully!');
            e.clearSelection(); // Clear the selection if needed
        });
    
        clipboard.on('error', function(e) {
            console.error('Could not copy text: ', e);
        });

    })  

    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while shortening the URL.');

    });

});

  function loadSongList() {
    generateSetlistURL()
    const songList = document.getElementById("songList");
    songList.innerHTML = '';

    console.log(originalSongList)
    originalSongList.forEach((song, index) => {
        const listItem = document.createElement("li");
        console.log(originalSongList)
        listItem.id = 'songinfo';
        // Create checkbox element
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `checkbox-${index}`;

        // Add event listener to add/remove the song from the setlist when checkbox is checked/unchecked
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                const selectedSong = originalSongList[index];
                addToSetlist(selectedSong);
            } else {
                const selectedSong = originalSongList[index];
                removeFromSetlist(selectedSong);
            }
        
        });

        // Create text span for song title and artist
        const textSpan = document.createElement("span");
        textSpan.innerHTML = `${index + 1}. ${song.title} - ${song.artist}`;

        // Add event listener to open lyrics site when text is clicked
        textSpan.addEventListener('click', () => openLyricsSite(song.title, song.artist));

        // Append checkbox and text span to list item
        listItem.appendChild(checkbox);
        listItem.appendChild(textSpan);

        // Append list item to song list
        songList.appendChild(listItem);
    });
}

function loadingSite(){
    document.body.innerHTML = "<style> \
    iframe { \
        width: 100vw; \
        height: 100vh; \
        border: none; \
        position: fixed; \
        top: 0; \
        left: 0; \
        z-index: 9999; \
        background: url('https://your-image-url.jpg') no-repeat center center fixed; \
        background-size: cover; \
    } \
</style> \
<iframe src='/loading'></iframe>";

}

function openLyricsSite(title, artist) {
    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    
    loadingSite()

    const dataToSend = {
        songAndArtist: `${cleanTitle} - ${cleanArtist}`,
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/receive_data", true);

    alert("hi")
    xhr.setRequestHeader("Content-Type", "application/json"); // Set Content-Type header to application/json
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {                                                               
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                window.location.href = "/lyrics?lyrics=" + encodeURIComponent(response.lyrics);
            } else {
                console.error("Failed to send data to Flask! Status:", xhr.status);
            }
        }
    };
    xhr.send(JSON.stringify(dataToSend));
    
}

function loadsearchedsongList() {
  generateSetlistURL()
  const searchedSongs = document.getElementById("searchedsongs");

  searchedSongs.innerHTML = '';

  searchedsongLists.forEach((song) => {
      const listItem = document.createElement("myli");
      listItem.id = 'searchedsongInfo';      // For CSS
      
      // Create text span for song title and artist
      const textSpan = document.createElement("span");
      textSpan.innerHTML = `${song.title} - ${song.artist}`;

      // Add event listener to open lyrics site when text is clicked
      textSpan.addEventListener('click', () => openLyricsSite(song.title, song.artist));

      listItem.appendChild(textSpan);

      // Append list item to song list
      searchedSongs.appendChild(listItem);
  });
}

function backward() {
    let storedData = localStorage.getItem('selectedSongs');
    if (storedData) {
    let songsArray = JSON.parse(storedData);

    let songTitles = [];
    let artists = [];

    for (let i = 0; i < songsArray.length; i++) {
        songTitles.push(songsArray[i].title);
        artists.push(songsArray[i].artist);
    }

    let currentsong = document.getElementById("title").textContent.split(" - ")

    console.log()

    openLyricsSite(songTitles[songTitles.indexOf(currentsong[0])-1] ,artists[songTitles.indexOf(currentsong[0])-1])


    } else {
    console.log('No data found in local storage');
    }
}



function forward() {
    let storedData = localStorage.getItem('selectedSongs');
    if (storedData) {
    let songsArray = JSON.parse(storedData);

    let songTitles = [];
    let artists = [];

    for (let i = 0; i < songsArray.length; i++) {
        songTitles.push(songsArray[i].title);
        artists.push(songsArray[i].artist);
    }

    let currentsong = document.getElementById("title").textContent.split(" - ")

    

    openLyricsSite(songTitles[songTitles.indexOf(currentsong[0])+1] ,artists[songTitles.indexOf(currentsong[0])+1])


    } else {
    console.log('No data found in local storage');
    }
}

fetchAndProcessCSV();

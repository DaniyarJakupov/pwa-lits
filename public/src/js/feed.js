var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

function openCreatePostModal() {
  createPostArea.style.display = "block";

  // Fire promtEvent
  if (promptEvent) {
    promptEvent.prompt();
    promptEvent.userChoice.then(result => {
      console.log(result.outcome);
    });

    promptEvent = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function createCard(post) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className =
    "shared-moment-card mdl-card mdl-shadow--2dp custom-card";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${post.img})`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = post.title;
  cardTitleTextElement.style.color = "#fff";
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = post.location;
  cardSupportingText.style.textAlign = "center";
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function updateUi(posts) {
  clearCards();
  posts.map(post => {
    createCard(post);
  });
}

var firebaseDataFetched = false;

// Fetch posts from firebase
(async function fetchPosts() {
  try {
    let res = await fetch("https://pwa-lits.firebaseio.com/posts.json");
    let data = await res.json();
    firebaseDataFetched = true;
    let dataArray = [];
    for (let prop in data) {
      dataArray.push(data[prop]);
    }
    updateUi(dataArray);
  } catch (e) {
    firebaseDataFetched = false;
  }
})();

// Use posts.json from IndexedDB if data from firebase is not fetched
if ("indexedDB" in window) {
  if (!firebaseDataFetched) {
    readDataFromDB("posts").then(data => {
      updateUi(data);
    });
  }
}

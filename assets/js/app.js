const postForm = document.getElementById("postForm");
const createPostBtn = document.getElementById("createPostBtn");
const updatePostBtn = document.getElementById("updatePostBtn");
const postTitle = document.getElementById("postTitle");
const postDescription = document.getElementById("postDescription");
const postContainer = document.getElementById("postContainer");
const basePostUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;

function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 3000
    })
}

const localState = {
    postArray: [],
    editId: null
}

//converter function 
function convertNesObjToArr(obj) {
    localState.postArray = Object.entries(obj).map(el => ({ ...el[1], id: el[0] })).reverse();
}
function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove("d-none");
    } else {
        spinner.classList.add("d-none");
    }
}

//genric function
async function fetchApi(url, method = "GET", body) {
    body = body ? JSON.stringify(body) : null
    try {
        let res = await fetch(url, {
            method: method,
            body: body,
            headers: {
                "Content-Type": "Application/json"
            }
        });

        if (!res.ok) {
            throw new Error(`Error while feching data, status : ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        snackBar(err, "error");
        console.log(err);
        throw err
    } finally {
        handleSpinner(false)
    }
}

//read

async function fetchPosts() {
    try {
        handleSpinner(true);
        let res = await fetchApi(`${basePostUrl}/posts.json`);
        convertNesObjToArr(res);
        renderPosts(localState.postArray);
    } catch (err) {
        snackBar(err, "error");
        console.log(err);
    } finally {
        handleSpinner(false)
    }

}


function renderPosts(arr) {
    let res = "";
    arr.forEach(post => {
        res += ` 
            <div class="col-md-3 mb-3" id="${post.id}">
                <div class="card h-100">
                    <div class="card-header bg-info text-white text-capitalize p-2">
                        <h2>${post.title}</h2>
                    </div>
                    <div class="card-body  pt-1">
                        <h4 class="text-capitalize desHeading ">${post.title} : </h4>
                        <p class="card-text description">${post.details}</p>
                    </div>
                    <div class="card-footer bg-info text-white d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-dark">Edit</button>
                        <button onclick="onDelete(this)" class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </div>
            </div>
        `
    });
    postContainer.innerHTML = res;
}

fetchPosts();

//create
async function onSubmit(event) {
    event.preventDefault()
    const newPost = {
        title: postTitle.value,
        details: postDescription.value,
        createdAt: Date.now()
    }

    try {
        handleSpinner(true)
        let res = await fetchApi(`${basePostUrl}/posts.json`, "POST", newPost);
        postForm.reset();
        newPost.id = res.name;
        localState.postArray.unshift(newPost);
        let newPostCard = document.createElement("div");
        newPostCard.className = "col-md-3 mb-3";
        newPostCard.id = res.name;
        newPostCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-header bg-info text-white text-capitalize p-2">
                        <h2>${newPost.title}</h2>
                    </div>
                    <div class="card-body  pt-1">
                        <h4 class="text-capitalize desHeading ">${newPost.title} : </h4>
                        <p class="card-text description">${newPost.details}</p>
                    </div>
                    <div class="card-footer bg-info text-white d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-dark">Edit</button>
                        <button onclick="onDelete(this)" class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </div>
        `;
        postContainer.prepend(newPostCard);
        snackBar(`New post with id ${res.name} is added successfully...`, "success");
    } catch (err) {
        snackBar(err, "error");
        console.log(err);
    } finally {
        handleSpinner(false)
    }

}

//delete
async function onDelete(ele) {
    const deleteId = ele.closest(".col-md-3").id;
    try {
        const isConfirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (isConfirm.isConfirmed) {
            const deleteUrl = `${basePostUrl}/posts/${deleteId}.json`;
            let res = await fetchApi(deleteUrl, "DELETE");
            const deleteIndex = localState.postArray.findIndex(p => p.id === deleteId);
            localState.postArray.splice(deleteIndex, 1);
            ele.closest(".col-md-3").remove();
            snackBar(`Post with id : ${deleteId} is deleted successfully...`, "success");
        } else {
            handleSpinner(false)
        }
    } catch (err) {
        snackBar(err, "error");
        console.log(err);
    } finally {
        handleSpinner(false)
    }
}

//edit
function onEdit(ele) {
    const editId = ele.closest(".col-md-3").id;
    localState.editId = editId;
    const editObj = localState.postArray.find(p => p.id === editId);
    postTitle.value = editObj.title;
    postDescription.value = editObj.details;
    createPostBtn.classList.add("d-none");
    updatePostBtn.classList.remove("d-none");
}

//update
async function onUpdate() {
    const updateId = localState.editId;
    const updateIndex = localState.postArray.findIndex(p => p.id === updateId);
    const existingPost = localState.postArray[updateIndex];
    const updatedObj = {
        ...existingPost,
        title: postTitle.value,
        details: postDescription.value,
        updatedAt: Date.now()
    }

    try {
        const udpateUrl = `${basePostUrl}/posts/${updateId}.json`;
        handleSpinner(true)
        const res = await fetchApi(udpateUrl, "PATCH", updatedObj);
        localState.editId = null;
        postForm.reset()
        localState.postArray[updateIndex] = updatedObj;
        let udpatePostCard = document.getElementById(updateId);
        udpatePostCard.innerHTML = `
            <div class="card h-100">
                <div class="card-header bg-info text-white text-capitalize p-2">
                        <h2>${updatedObj.title}</h2>
                </div>
                    <div class="card-body pt-1">
                        <h4 class="text-capitalize desHeading ">${updatedObj.title} : </h4>
                        <p class="card-text description">${updatedObj.details}</p>
                    </div>
                    <div class="card-footer bg-info text-white d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-dark">Edit</button>
                        <button onclick="onDelete(this)" class="btn btn-sm btn-danger">Delete</button>
                    </div>
            </div>
        `;
        snackBar(`Post with id ${updateId} is udpated successfully...`, "success");
        createPostBtn.classList.remove("d-none");
        updatePostBtn.classList.add("d-none");
    } catch (err) {
        snackBar(err, "error");
        console.log(err);
    } finally {
        handleSpinner(false)
    }
}
postForm.addEventListener("submit", onSubmit);
updatePostBtn.addEventListener("click", onUpdate);

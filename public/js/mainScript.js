let userId = null

if (!window.localStorage.token) window.location = 'register'

const socket = io()

const picker = new EmojiButton({
    showSearch: false,
    showPreview: false,
});
const trigger = document.querySelector('#emoji-trigger');

picker.on('emoji', emoji => {
    comment.value += emoji
});

trigger.addEventListener('click', () => picker.togglePicker(trigger));

socket.emit('started', { token: window.localStorage.token })

socket.on('error', () => {
    window.localStorage.removeItem('token')
    window.location = '/register'
})

socket.on('userInfo', ({ username, userImg, user_id }) => {
    userName.textContent = username
    userImage.innerHTML = `<img src="images/${userImg}">`
    userId = user_id
})

socket.on('friends', async() => {
    await replaceFriends()
})

socket.on('replaceFriends', async(message) => {
    await replaceFriends()
    
    if (!friendProfile.childNodes.length) return
    
    if (friendProfile.childNodes[0].id == message.who) {
        if (message.text) {
            conversation.innerHTML += `<div class="row message-body">
            <div class="col-sm-12 message-main-receiver">
            <div class="receiver">
            <div class="message-text">
            ${message.text}
            </div>
            <span class="message-time pull-right">
            ${message.createdAt}  
            </span>
            </div>
            </div>
            </div>`
        } else if (message.img) {
            conversation.innerHTML += `<div class="row message-body">
            <div class="col-sm-12 message-main-receiver">
            <div class="receiver">
            <img src=images/${message.img} class="sendedImg">
            <span class="message-time pull-right">
            ${message.createdAt}  
            </span>
            </div>
            </div>
            </div>`
        }
    }
})

socket.on('chatCleared', async({ friendId }) => {
    await replaceFriends()
    
    
    if (!friendProfile.childNodes.length) return
    
    if (friendProfile.childNodes[0].id == friendId) {
        conversation.innerHTML = null
        friendProfile.innerHTML = null
    }
    
})

socket.on('userCleared', async({ userId }) => {
    await replaceFriends()
    
    
    if (!friendProfile.childNodes.length) return
    
    if (friendProfile.childNodes[0].id == userId) {
        conversation.innerHTML = null
        friendProfile.innerHTML = null
    }
    
})

allUsersBoard.onclick = async() => {
    let users = await(await fetch('/users')).json()
    allUsersShow.innerHTML = null
    
    for (let user of users) {
        if (user.username == userName.textContent || !user.username.toLowerCase().includes(composeText.value.toLowerCase())) continue
        allUsersShow.innerHTML += `<div class="row sideBar-body" onclick=clicked(this)>
        <div class="col-sm-3 col-xs-3 sideBar-avatar">
        <div class="avatar-icon">
        <img src="images/${user.user_img}">
        </div>
        </div>
        <div class="col-sm-9 col-xs-9 sideBar-main">
        <div class="row">
        <div class="col-sm-8 col-xs-8 sideBar-name">
        <span class="name-meta" id="${user._id}">${user.username}
        </span>
        </div>
        <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
        <span class="time-meta pull-right">${user.is_online ? '🟢':new Date(user.updatedAt).toLocaleString()}
        </span>
        </div>
        </div>
        </div>
        </div>`
    }
}

searchText.onkeyup = async() => {
    await replaceFriends(searchText.value)
}

composeText.onkeyup = async(e) => {
    let users = await(await fetch('/users')).json()
    allUsersShow.innerHTML = null
    
    for (let user of users) {
        if (user.username == userName.textContent || !user.username.toLowerCase().includes(composeText.value.toLowerCase())) continue
        allUsersShow.innerHTML += `<div class="row sideBar-body" onclick=clicked(this)>
        <div class="col-sm-3 col-xs-3 sideBar-avatar">
        <div class="avatar-icon">
        <img src="images/${user.user_img}">
        </div>
        </div>
        <div class="col-sm-9 col-xs-9 sideBar-main">
        <div class="row">
        <div class="col-sm-8 col-xs-8 sideBar-name">
        <span class="name-meta" id="${user.user_id}">${user.username}
        </span>
        </div>
        <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
        <span class="time-meta pull-right">${user.is_online ? '🟢':new Date(user.updatedAt).toLocaleString()}
        </span>
        </div>
        </div>
        </div>
        </div>`
    }
}

comment.onkeyup = async e => {
    if (e.keyCode == 13) {
        await send()
        comment.value = null
    }
}

async function clicked(user) {
    $(".side-two").css({ "left": "-100%" });
    
    let id = user.childNodes[3].childNodes[1].childNodes[1].childNodes[1].id

    friendProfile.innerHTML = `<div id=${id} class="col-sm-2 col-md-1 col-xs-3 heading-avatar">
    <div class="heading-avatar-icon">
    <img src="${user.childNodes[1].childNodes[1].childNodes[1].src}">
    </div>
    </div>
    <div class="col-sm-8 col-xs-7 heading-name">
    <p class="heading-name-meta">${user.childNodes[3].childNodes[1].childNodes[1].childNodes[1].textContent}</p>
    </div>
    <div class="col-sm-1 col-xs-1  heading-dot pull-right">
    <i onclick="deleteChat()" class="fa fa-trash pull-right" aria-hidden="true"></i>
    </div>`

    let res = await fetch('/friendMessage', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId, friendId: id})
    })
    res = await res.json()
    
    conversation.innerHTML = null
    for (let chat of res.messages) {
        chat.createdAt = new Date(chat.createdAt).toLocaleString()
        if (chat.who != userId) {
            if (chat.text) {
                conversation.innerHTML += `<div class="row message-body">
                <div class="col-sm-12 message-main-receiver">
                <div class="receiver">
                <div class="message-text">
                ${chat.text}
                </div>
                <span class="message-time pull-right">
                ${chat.createdAt}  
                </span>
                </div>
                </div>
                </div>`
            } else {
                conversation.innerHTML += `<div class="row message-body">
                <div class="col-sm-12 message-main-receiver">
                <div class="receiver">
                <img src=images/${chat.img} class="sendedImg">
                <span class="message-time pull-right">
                ${chat.createdAt}  
                </span>
                </div>
                </div>
                </div>`
            }
            
        } else {
            if (chat.text) {
                conversation.innerHTML += `<div class="row message-body">
                <div class="col-sm-12 message-main-sender">
                <div class="sender">
                <div class="message-text">
                ${chat.text}
                </div>
                <span class="message-time pull-right">
                ${chat.createdAt}  
                </span>
                </div>
                </div>
                </div>`
            } else {
                conversation.innerHTML += `<div class="row message-body">
                <div class="col-sm-12 message-main-sender">
                <div class="sender">
                <img src=images/${chat.img} class="sendedImg">
                <span class="message-time pull-right">
                ${chat.createdAt}  
                </span>
                </div>
                </div>
                </div>`
            }
        }
    }
    conversation.scrollTo({ top: 1000000000 });
}

async function send() {
    if ((!comment.value.trim() && !image.value) || !friendProfile.childNodes.length) return alert('You missed something!!!')
    let today = new Date(), date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(), time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(), dateTime = date+' '+time;
    
    if ((comment.value && !image.value) && !/(\<\w*)((\s\/\>)|(.*\<\/\w*\>))/.test(comment.value)) {
        conversation.innerHTML += `<div class="row message-body">
        <div class="col-sm-12 message-main-sender">
        <div class="sender">
        <div class="message-text">
        ${comment.value.trim()}
        </div>
        <span class="message-time pull-right">
        ${dateTime}
        </span>
        </div>
        </div>
        </div>`
        
        socket.emit('textSended', { userId, friendId: friendProfile.childNodes[0].id, text: comment.value, time: dateTime })
        comment.value = null
        conversation.scrollTo({ top: 1000000000 });
        
        await replaceFriends()
    } else if (!comment.value && image.value) {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(image.files[0].type) || image.files[0].size >= 10 * 1024 * 1024) {alert('Wrong type to upload'); placeOfImage.innerHTML = `<input type="file" accept=".png, .jpg, .jpeg" id="image"/><i class="fa fa-upload" style="font-size:24px"></i>`; return}
        
        let formData = new FormData()
        formData.append('image', image.files[0])
        
        let res = await fetch('/upload', {
            method: 'POST',
            body: formData
        })
        
        res = await res.json()
        
        if (res.status == 200) {
            conversation.innerHTML += `<div class="row message-body">
            <div class="col-sm-12 message-main-sender">
            <div class="sender">
            <img src=images/${res.name} class="sendedImg">
            <span class="message-time pull-right">
            ${dateTime}  
            </span>
            </div>
            </div>
            </div>`
            
        } else if (res.status == 400) {
            alert(res.message)
        }
        
        socket.emit('imgSended', { userId, friendId: friendProfile.childNodes[0].id, img: res.name, time: dateTime })
        placeOfImage.innerHTML = `<input type="file" accept=".png, .jpg, .jpeg" id="image"/><i class="fa fa-upload" style="font-size:24px"></i>`
        conversation.scrollTo({ top: 1000000000 });
        
        await replaceFriends()
    } else if (comment.value && image.value) {
        comment.value = null
        placeOfImage.innerHTML = `<input type="file" accept=".png, .jpg, .jpeg" id="image"/><i class="fa fa-upload" style="font-size:24px"></i>`
        
        alert('Choose one of them dude')
    } else {
        comment.value = null
        placeOfImage.innerHTML = `<input type="file" accept=".png, .jpg, .jpeg" id="image"/><i class="fa fa-upload" style="font-size:24px"></i>`
        alert('You missed something!!!')
    }
}

async function replaceFriends(value = '') {
    let res = await fetch('/userFriends', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId, value })
    })
    
    res = await res.json()
    
    friends.innerHTML = null
    
    for (let user of res.friends) {
        if (!user) continue
        
        friends.innerHTML += `<div class="row sideBar-body" onclick=clicked(this)>
        <div class="col-sm-3 col-xs-3 sideBar-avatar">
        <div class="avatar-icon">
        <img src="images/${user.user_img}">
        </div>
        </div>
        <div class="col-sm-9 col-xs-9 sideBar-main">
        <div class="row">
        <div class="col-sm-8 col-xs-8 sideBar-name">
        <span class="name-meta" id="${user._id}">${user.username}
        </span>
        </div>
        <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
        <span class="time-meta pull-right">${user.is_online ? '🟢':new Date(user.updatedAt).toLocaleString()}
        </span>
        </div>
        </div>
        </div>
        </div>`
    }
}

function deleteChat() {
    let agree = confirm('Are you really wanting this?')
    
    if (agree) {
        socket.emit('deleteChat', { friendId: friendProfile.childNodes[0].id, userId })
    }
}

function deleteUser() {
    let agree = confirm('Are you really wanting this?')
    
    if (agree) {
        socket.emit('deleteUser', { userId })
        window.localStorage.removeItem('token')
        window.location = '/register'
    }
}
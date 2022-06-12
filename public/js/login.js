if (window.localStorage.token) window.location = '/'

submit.onclick = async(e) => {
    try {
        e.preventDefault()
        
        if (username.value.trim().split(' ').length > 1 || username.value.length <= 2 || password.value.length <= 3 || password.value.trim().split(' ').length > 1 || !username.value || !password.value) return alert('Invalid input')
        
        let res = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: username.value, password: password.value })
        })
        
        res = await res.json()
        
        if (res.status == 200) {
            window.localStorage.token = res.token
            window.location = '/'
        } else if (res.status == 400) alert(res.message)

    } catch (error) {
        alert(error.message)
    }
}




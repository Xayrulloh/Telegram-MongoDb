if (window.localStorage.token) window.location = '/'
submit.onclick = async(e) => {
  e.preventDefault()
  
  if (username.value.trim().split(' ').length > 1 || username.value.length <= 2 || password.value.length <= 3 || password.value.trim().split(' ').length > 1 || !username.value || !password.value || !image.files.length || /(\<\w*)((\s\/\>)|(.*\<\/\w*\>))/.test(username.value)) return alert('Invalid input')

  if (['image/jpeg', 'image/png', 'image/jpg'].includes(image.files[0].type) || image.files[0].size <= 10 * 1024 * 1024) {
    let formData = new FormData()
    formData.append('image', image.files[0])
    formData.append('username', username.value)
    formData.append('password', password.value)
    
    try {
      let res = await fetch('/register', {
        method: 'POST',
        body: formData
      })

      res = await res.json()

      if (res.status == 200) {
        window.localStorage.token = res.token
        window.location = '/'
      } else if (res.status == 400) {
        alert(res.message)
        username.value = null
        password.value = null
      }

    }catch (error) {
      alert(error.message)
    }
  } else alert('Invalid input')
}




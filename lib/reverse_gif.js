export default {
  init(cavnasID, inputID, resultImgID) {
    let canvas = document.getElementById(cavnasID)
    let ctx = canvas.getContext('2d')
    let input = document.getElementById(inputID)
    input.addEventListener('change', function(e) {
      let file = e.target.files[0]
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = function(e) {
        let src = e.target.result
        createImg(src)
      }
    })
    function createImg(src) {
      let img = document.createElement('img')
      img.setAttribute('rel:animated_src', src)
      img.setAttribute('rel:auto_play', '1')
      img.setAttribute('rel:rubbable', '1')
      img.src = src
      document.body.insertBefore(img, canvas)
      img.onload = function(e) {
        canvas.width = img.width
        canvas.height = img.height

        let rub = new SuperGif({ gif: img })
        let img_list = []

        let gif = new GIF({
          workers: 2,
          quality: 30,
          workerScript: "lib/gif.worker.js",
        })

        // rub 挂载gif图片完成
        rub.load(function(e) {
          for(let i = 0; i < rub.get_length(); i++) {
            // 遍历gif实例的每一帧
            rub.move_to(i)
            let cur_file = convertCanvasToImage(rub.get_canvas(), 'new' + i)
            img_list.push({
              file_name: cur_file.name,
              url: URL.createObjectURL(cur_file),
              file: cur_file,
            })
          }
          let imgObjList = []
          let count = 0
          img_list = img_list.reverse()
          for(let i = 0; i < img_list.length; i++) {
            let tmpImg = new Image()
            imgObjList.push(tmpImg)
            tmpImg.src = img_list[i].url
            tmpImg.onload = function() {
              count++
              if(count === img_list.length) {
                generateGif(imgObjList)
              }
            }
          }
        })

        // 路径转文件
        function dataURLtoFile(dataurl, filename) {
          let arr = dataurl.split(',')
          let mime = arr[0].match(/:(.*?);/)[1]
          let bstr = atob(arr[1])
          let n = bstr.length
          let u8arr = new Uint8Array(n)
          while(n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          return new File([u8arr], filename, { type: mime })
        }

        // 将canvas转换成file对象
        function convertCanvasToImage(canvas, filename) {
          return dataURLtoFile(canvas.toDataURL('image/png'), filename)
        }

        // 生成gif
        function generateGif(imgObjList) {
          for(let i = 0; i < imgObjList.length; i++) {
            ctx.save()
            ctx.drawImage(imgObjList[i], 0, 0, canvas.width, canvas.height)
            ctx.restore()
            gif.addFrame(canvas, { copy: true, delay: 100 })
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
          gif.render()
        }

        // gif.js renderer完成
        gif.on("finished", function(blob) {
          console.log(URL.createObjectURL(blob))
          let file = new FileReader()
          file.readAsDataURL(blob)
          file.onload = function() {
            document.getElementById(resultImgID).setAttribute("src", file.result)
          }
        })
      }
    }
  }
}
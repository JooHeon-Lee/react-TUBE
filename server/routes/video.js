const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Video } = require("../models/Video")
const { auth } = require("../middleware/auth");
const multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');
const { response } = require('express');

let storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"uploads/");
    },
    filename: (req,file,cb) => {
        cb(null,`${Date.now()}_${file.originalname}`);
    },
    fileFilter: (req,file,cb) => {
        const ext = path.extname(file.originalname)
        if(ext !== '.mp4') {
            return cb(res.status(400).end('mp4파일만 가능합니다.'))
        }
        cb(null,true)
    }
});

const upload = multer({ storage : storage }).single("file");

//=================================
//             Video
//=================================

router.post("/uploadfiles",(req,res) => {

    //클라에서 받은 비디오를 서버에 저장

    upload(req,res,err => {
        if(err) {
            return res.json({success:false,err})
        }
        return res.json({success:true,url:res.req.file.path,fileName:res.req.file.filename})
    })
})

router.post("/uploadVideo",(req,res) => {
    
    //db에 비디오를 저장한다.

    const video = new Video(req.body)

    //몽고db의 메소드인 save메소드사용해서 바로 저장
    video.save((err,doc) => {
        if(err) return response.json({success:false,err})
        res.status(200).json({success:true})
    })

})
router.post("/DeleteVideo",(req,res) => {
    
    //db에 비디오를 저장한다.

    const video = new Video(req.body)

    //몽고db의 메소드인 save메소드사용해서 바로 저장
    video.deleteOne({title:req.body.title},function (err,result) {
        if(err) return response.json({success:false,err})
        res.status(200).json({success:true})
    })

})

router.post("/updateVideo",(req,res) => {
    
    //db에 비디오를 저장한다.

    console.log("타이틀은..." + req.body.title);
    const video = new Video(req.body)


    Video.findOneAndUpdate({ writer:video.writer}, { title:video.title,description:video.description,privacy:video.privacy,filePath:video.filePath,duration:video.duration,thumbnail:video.thumbnail}, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });

})

router.get("/getVideos",(req,res) => {

    //db에서 비디오를 가져와서 클라이언트에 보낸다.
    //video콜렉션안의 모든걸 가져옴.
    Video.find()
    .populate('writer')
    .exec((err,videos) => {
        if(err) return res.status(400).send(err)
        res.status(200).json({success:true,videos})
    })
   
})

router.post("/getVideoDetail", (req, res) => {
    Video.findOne({ _id: req.body.videoId })
      .populate("writer")
      .exec((err, videoDetail) => {
        if (err) return res.status(400).send(err);
        return res.status(200).json({ success: true, videoDetail });
      });
  });

router.post("/thumbnail",(req,res) => {


    let filePath = ""
    let fileDuration = ""
    //비디오 정보 가져오기
    ffmpeg.setFfmpegPath('C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe')
    ffmpeg.ffprobe(req.body.url,function(err,metadata) {
     
        fileDuration = metadata.format.duration
    });
    //썸네일 생성
    ffmpeg(req.body.url)
    .on('filenames',function(filenames) {
        console.log('Will generate' + filenames.join(','))
        console.log(filenames)

        filePath="uploads/thumbnails/" + filenames[0]
    })
    .on('end',function() {
        console.log('Screenshots taken');
        return res.json({success:true,url:filePath,fileDuration:fileDuration})
    })
    .on('error',function(err) {
        console.log(err);
        return res.json({success:false,err});
    })
    .screenshots({
        count:1, // 3개의 썸네일 생성
        folder:'uploads/thumbnails',
        size:'320x240',
        filename:'thumbnail-2.png'
    })

})

module.exports = router;

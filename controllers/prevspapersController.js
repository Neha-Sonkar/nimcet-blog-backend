import Papers from '../models/PreviousYrsPapers.js'
import dotenv from 'dotenv'
dotenv.config()

export const upload = async (req, res) => {
    try {
        const { year } = req.body
        const { originalname, buffer, mimetype } = req.file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.'
            });
        }
        if (mimetype !== 'application/pdf') {
            return res.status(400).json({
                success: false,
                message: 'Only PDF files are allowed.'
            })
        }
        const pdf = new Papers({
            year: year,
            filename: originalname,
            data: buffer,
            contentType: mimetype
        })
        await pdf.save()
        res.status(200).json({
            success: true, message: "File uploaded successfully"
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        })
    }
}

export const getpapers = async (req, res) => {
    try {
        const result = await Papers.find();
        res.status(200).json({
            success: true,
            data: result.map(papers=>({
                id:papers._id,
                name:papers.filename,
                year:papers.year
            }))
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        })
    }
}

export const getpdf=async(req,res)=>{
    try{
        const paper=await Papers.findById(req.params.id)
        if(!paper){
            return res.status(404).json({ success: false, message: 'PDF not found' })
        }
        res.setHeader('content-Type',paper.contentType)
        res.setHeader('Content-Disposition', `inline; filename="${paper.filename}"`)
        res.send(paper.data)
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch PDF' })
    }
}

export const pdfdelete=async(req,res)=>{
    try{
        const paper=await Papers.findById(req.params.id) 
        if(!paper){
            return res.status(404).json({ success: false, message: 'PDF not found' })
        }
        const result=await Papers.deleteOne({_id:req.params.id})
        if(!result){
            return res.status(404).json({ success: false, message: 'Something went wrong' })
        }
        return res.status(200).json({ success: false, message: 'Deleted successfully!' })
    }
    catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete PDF' })}
}
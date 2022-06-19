const express = require('express');
const path = require('path');
const { dbQuery } = require('./models/db');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const multer = require('multer');
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/');
  },
  filename: function (req, file, cb) {
    const fileName =
      file.originalname.split('.')[0] +
      Date.now() +
      path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

const getArticle = async (req, res) => {
  try {
    const data = await dbQuery('SELECT * FROM articles');
    console.log(data.length < 1);

    if (data.length < 1) {
      return res.render('blog', {
        article: data,
      });
    }

    const contents = data[0].contents;
    let firstTextContents = '';

    if (contents.length >= 100) {
      firstTextContents = contents.slice(0, contents.length / 10);
    } else {
      firstTextContents = contents.slice(0, contents.length / 2);
    }

    const lastTextContents = contents.slice(
      firstTextContents.length,
      contents.length
    );

    res.render('blog', {
      article: data,
      firstTextContents,
      lastTextContents,
    });
  } catch (error) {
    res.json({
      message: error.sqlMessage,
    });
  }
};

const postArticle = async (req, res) => {
  const { title, contents } = req.body;
  try {
    const id = uuid.v4();
    const image = `./img/${req.file.filename}`;
    console.log(req.file);
    const insertArticle = await dbQuery(
      'INSERT INTO articles (id,title,contents, image) VALUES (?,?,?, ?)',
      [id, title, contents, image]
    );

    // if (
    //   req.file.mimetype != 'image/jpeg' ||
    //   req.file.mimetype != 'image/jpg' ||
    //   req.file.mimetype != 'image/png'
    // ) {
    //   return res.json({
    //     status: false,
    //     message: 'Invalid file type',
    //   });
    // }

    res.redirect('/blog');
  } catch (error) {
    res.json({
      status: false,
      message: 'Gagal menambah data',
      error,
    });
  }
};

const deleteArticle = async (req, res) => {
  const id = req.params.id;
  const data = await dbQuery('DELETE FROM articles WHERE id=?', [id]);

  res.redirect('/blog');
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

app.get('/article', (req, res) => {
  res.render('form_article');
});

app.get('/blog', getArticle);
app.post('/submit-article', upload.single('image'), postArticle);
app.get('/delete/:id', deleteArticle);

app.listen(3000, () => {
  console.log('Server is running....');
});

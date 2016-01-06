import path from 'path';
import iso from 'react-iso';
import morgan from 'morgan';

export default function(app) {
  app.use(morgan('dev'));
  iso(app, {
    root: path.join(__dirname, 'app')
  });
}

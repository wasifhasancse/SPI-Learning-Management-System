import 'dotenv/config';
import app from './src/app';

if (require.main === module && process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT;
  if (!port) {
    throw new Error('PORT must be defined in backend environment variables');
  }

  app.listen(Number(port), () => {
    console.log(`[INFO] SPI LMS Backend API running on port ${port}`);
  });
}

export default app;

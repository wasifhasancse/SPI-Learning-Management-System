import db from '../config/db';
import { Course, CreateCourseDto, UpdateCourseDto } from '../types';

export const CourseModel = {
  async findAll(): Promise<Course[]> {
    const query = `
      SELECT 
        c.*, 
        COUNT(l.id)::int AS lecture_count
      FROM courses c
      LEFT JOIN lectures l ON c.id = l.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC;
    `;
    const { rows } = await db.query<Course>(query);
    return rows;
  },

  async findById(id: number | string): Promise<Course | null> {
    const query = `
      SELECT 
        c.*, 
        COUNT(l.id)::int AS lecture_count
      FROM courses c
      LEFT JOIN lectures l ON c.id = l.course_id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const { rows } = await db.query<Course>(query, [id]);
    return rows[0] || null;
  },

  async create({ title, description, price, thumbnail_url }: CreateCourseDto): Promise<Course> {
    const query = `
      INSERT INTO courses (title, description, price, thumbnail_url, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const values = [title, description || '', Number(price) || 0, thumbnail_url || ''];
    const { rows } = await db.query<Course>(query, values);
    return rows[0];
  },

  async update(id: number | string, { title, description, price, thumbnail_url }: UpdateCourseDto): Promise<Course | null> {
    const query = `
      UPDATE courses
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        thumbnail_url = COALESCE($4, thumbnail_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const values = [
      title !== undefined ? title : null,
      description !== undefined ? description : null,
      price !== undefined ? Number(price) : null,
      thumbnail_url !== undefined ? thumbnail_url : null,
      id
    ];
    const { rows } = await db.query<Course>(query, values);
    return rows[0] || null;
  },

  async delete(id: number | string): Promise<Course | null> {
    const query = `DELETE FROM courses WHERE id = $1 RETURNING *;`;
    const { rows } = await db.query<Course>(query, [id]);
    return rows[0] || null;
  }
};

export default CourseModel;


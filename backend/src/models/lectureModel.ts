import db from '../config/db';
import { Lecture, CreateLectureDto, UpdateLectureDto } from '../types';

export const LectureModel = {
  async findAll(): Promise<Lecture[]> {
    const query = `
      SELECT 
        l.*,
        c.title AS course_title
      FROM lectures l
      LEFT JOIN courses c ON l.course_id = c.id
      ORDER BY l.course_id ASC, l.order_index ASC, l.id ASC;
    `;
    const { rows } = await db.query<Lecture>(query);
    return rows;
  },

  async findByCourseId(courseId: number | string): Promise<Lecture[]> {
    const query = `
      SELECT * 
      FROM lectures
      WHERE course_id = $1
      ORDER BY order_index ASC, id ASC;
    `;
    const { rows } = await db.query<Lecture>(query, [courseId]);
    return rows;
  },

  async findById(id: number | string): Promise<Lecture | null> {
    const query = `
      SELECT * 
      FROM lectures
      WHERE id = $1;
    `;
    const { rows } = await db.query<Lecture>(query, [id]);
    return rows[0] || null;
  },

  async create({ course_id, title, description, video_url, order_index }: CreateLectureDto): Promise<Lecture> {
    let nextOrder = order_index;
    if (nextOrder === undefined || nextOrder === null) {
      const maxRes = await db.query<{ next_index: number }>(
        'SELECT COALESCE(MAX(order_index), 0) + 1 AS next_index FROM lectures WHERE course_id = $1',
        [course_id]
      );
      nextOrder = maxRes.rows[0].next_index;
    }

    const query = `
      INSERT INTO lectures (course_id, title, description, video_url, order_index, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const values = [course_id, title, description || '', video_url, Number(nextOrder)];
    const { rows } = await db.query<Lecture>(query, values);
    return rows[0];
  },

  async update(id: number | string, { title, description, video_url, order_index }: UpdateLectureDto): Promise<Lecture | null> {
    const query = `
      UPDATE lectures
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        video_url = COALESCE($3, video_url),
        order_index = COALESCE($4, order_index),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const values = [
      title !== undefined ? title : null,
      description !== undefined ? description : null,
      video_url !== undefined ? video_url : null,
      order_index !== undefined ? Number(order_index) : null,
      id
    ];
    const { rows } = await db.query<Lecture>(query, values);
    return rows[0] || null;
  },

  async delete(id: number | string): Promise<Lecture | null> {
    const query = `DELETE FROM lectures WHERE id = $1 RETURNING *;`;
    const { rows } = await db.query<Lecture>(query, [id]);
    return rows[0] || null;
  }
};

export default LectureModel;


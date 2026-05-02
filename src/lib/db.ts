import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const pool = {
    query: async (text: string, params?: unknown[]) => {
        const rows = await sql.query(text, params || []);
        return { rows };
    },
};

export default pool;

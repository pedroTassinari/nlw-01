import knex from '../database/connection';
import {Request, Response} from 'express';

class PointsController{
    async index(req: Request, res: Response){
        let {city, uf, items} = req.query;

        let parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        let points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');
        
        let serializedPoints = points.map(point => {
            return {
                ...points,
                image_url: `http://192.168.210.104:3333/uploads/${point.image}`,
            }
        });
        
        return res.json(serializedPoints);
    }

    async create(req: Request, res: Response){
        let {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;
    
        const trx = await knex.transaction();

        let point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
    
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        let pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        });
    
        await trx('point_items').insert(pointItems);

        await trx.commit();
    
        return res.json({
            id: point_id,
            ...point
        });
    }

    async show(req: Request, res: Response){
        let {id} = req.params;

        let point = await knex('points').where('id', id).first();

        if (!point)
            return res.status(400).json({message : 'Ponto não encontrado'});
        
        let serializedPoint = {
            ...point,
            image_url: `http://192.168.210.104:3333/uploads/${point.image}`,
        }
        
        //select * from items join point_items on items.id = point_items.item_id 
        //    where point_items.point_id = 3;
        
        let items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');
        
        return res.json({serializedPoint, items});
    }
}

export default PointsController;
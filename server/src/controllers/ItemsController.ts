import knex from '../database/connection';
import {Request, Response} from 'express';

class ItemsController{
    async index(req: Request, res: Response){
        let items = await knex('items').select('*');
    
        let serializedItems = items.map(item => {
            return {
                title: item.title,
                image_url: `http://192.168.210.104:3333/uploads/${item.image}`,
                id: item.id
            }
        });
    
        return res.json(serializedItems);
    }
}

export default ItemsController;
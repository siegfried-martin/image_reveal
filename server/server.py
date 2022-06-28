import asyncio
import websockets
import json
import trax

games = {}

async def start(websocket, test):
    trax.trax(websocket, test)
    async for message in websocket:
        trax.trax("new message:\n"+message)
        data = json.loads(message)
        trax.trax(data)
        await websocket.send("yay")

start_server = websockets.serve(start, "0.0.0.0", 40000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
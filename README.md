# Video Summarization

## Prerequisite
- Unix based OS
- Docker
- NodeJS

## Configuaration
- Modify file client/src/app/models/IpServer.ts and replace 13.76.172.134 with localhost
- Install dependecies of node "npm install" on "server"'s folder and "client"'s folder
- Navigate to project root folder and run 
    - sudo chmod a+x startContainer.sh
    - sudo chmod a+x stopContainer.sh

## Start with Code Live Reload for Sever and Client
- Navigate to project root folder and run 
    - sudo ./startContainer.sh

## Stop Server and Client
- Navigate to project root folder and run 
    - sudo ./stopContainer.sh

## Verification
- Server runs on http://localhost:3300
- Client runs on http://localhost:4200
<h1 align="center">OUTLINE</h1>
<div align="center">
  :confetti_ball:<a href="https://www.nonstops.site/">Website</a>:confetti_ball:
</div>

<br>

<div align="center" style="margin-top:5px">
  <img src="https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/55d5ab11-7dcc-45de-9e92-ba2a2179ad36" alt="Outline logo">
</div>

<br>

Outline is a restaurant reservation system designed to enhance management efficiency and reduce labor costs for restaurants. This system is equipped with four key features:

1. Reservation Management
2. Waitlist Management
3. Traffic Dashboard
4. AI Customer Service

This system utilizes AWS services to achieve a stateless architecture, enhancing scalability. It employs horizontal scaling and a cache write-back strategy for efficiently handling high-concurrency reservation requests. These features collectively ensure the system's high availability, high reliability, and high performance.

<br>

## Table of Content

- [Tech Stack](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/blob/main/README.md#tech-stack)
- [Features](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/blob/main/README.md#features)
- [Architecture](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/blob/main/README.md#architecture)
- [Database Schema](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/blob/main/README.md#database-schema)

<br>

## Tech Stack

### Back-End

![image](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![image](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![image](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white)
![image](https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=Socket.io&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991.svg?style=for-the-badge&logo=OpenAI&logoColor=white)
![image](https://img.shields.io/badge/Lua-2C2D72.svg?style=for-the-badge&logo=Lua&logoColor=white)
![image](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

![image](https://img.shields.io/badge/Chart%20js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

### Cloud Service (AWS)

![image](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)

- EC2
- RDS
- ElastiCache
- Elastic Load Balancing
- AutoScaling
- Lambda
- SQS
- EventBridge
- S3
- CloudFront

### Database

![image](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![image](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)

### Tools

![image](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white)
![image](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![image](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![image](https://img.shields.io/badge/k6-7D64FF.svg?style=for-the-badge&logo=k6&logoColor=white)
![image](https://img.shields.io/badge/Vitest-6E9F18.svg?style=for-the-badge&logo=Vitest&logoColor=white)

<br>

## Features

### Reservation

After logging in, restaurant operators can navigate to the reservation management page. Here, they have the option to manually enter customer reservation details in the 'Add Reservation' section. Additionally, they can visit the 'Confirm Reservations' section to view all reservation information and make necessary status updates as required

https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/fc746251-5eed-4c43-9455-a80571256504

### Waitlist

After logging into Outline, operators can access the reservation management page and select 'Add to Waitlist' to manually enter a customer's waitlist information. Once the waitlisting is successful, a waitlist number will be generated. Operators can then proceed to the waitlist confirmation page and click 'Call Number' to notify customers in real-time about their advancing position in the queue.

https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/379208c1-5687-4b38-b04e-27c1d3aaac50

### Restaurant Traffic Analysis Dashboard

Upon accessing the Traffic Report page, restaurant operators can view peak customer flow times, enabling them to better schedule staff shifts and plan for ingredient purchases accordingly.

https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/7697643b-541a-40cb-afeb-e1909a55c822

### AI Customer Service

Within the restaurant reservation page for consumers, visitors can click on the AI customer service icon in the bottom right corner to inquire about frequently asked questions regarding the restaurant. This feature significantly reduces the workload on the restaurant's waitstaff by handling common guest inquiries.

https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/ce5191e0-061d-4a35-bbd3-b11e01c71078

### Demo Account

| Email         | Password |
| ------------- | -------- |
| test@test.com | Test123/ |

<br>

## Architecture

### Reservation Architecture

The diagram below illustrates the backend architecture of our restaurant reservation system, which is divided into four main components:

1. **Asynchronous Reservation Confirmation Notifications:** Upon successful reservation, the server places the reservation details into AWS SQS. A Lambda function then acts as a worker using Gmail with SMTP to send confirmation emails to guests.
2. **AI Customer Service:** This is implemented through integration with OpenAI.
3. **Automatic Update of Available Reservation Times:** Scheduled via AWS EventBridge to periodically trigger a Lambda function that updates the database with available reservation times.
4. **Cache Write-Back Mechanism:** During the reservation process, database updates are asynchronously managed using a cache write-back mechanism, as detailed in the second architecture diagram.

Achieved a stateless server configuration through the implementation of the aforementioned architectural design.

![Reservation Architecture](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/3dd7fc53-6acb-46de-b2c3-479e8748d5cd)
Figure 1 Reservation Architecture

### High Concurrent Reservation Request Architecture

For popular restaurants, the release of new available reservation times often triggers a surge of reservation requests simultaneously. The Outline reservation system handles these concurrent requests through time-scheduled Auto Scaling and a cache write-back mechanism as shown in figure 2. The k6 spike testing indicates:

1. As shown in the figure 3, the relationship between the number of EC2 instances and RPS (Requests Per Second) can be deduced from the regression line (RPS = 659.13 \* (#EC2 instances) - 101.71), allowing us to estimate the necessary number of horizontally scaled EC2 instances to handle a corresponding RPS. This also enables cost estimation based on EC2 pricing.

2. Figure 4 indicates that the CPU utilization of Redis remains below 30% during spike testing suggests that this system architecture can withstand concurrent requests exceeding 5000 RPS. The upper limit is yet to be tested.

![High Concurrent Request Arichitecture](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/34eb06be-363c-475c-bd4b-57013d5e0f35)
Figure 2 High Concurrent Request Architecture

![EC2 Horizontal Scaling Effect on RPS](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/2eed8d53-90fd-4a78-ad92-f1be334ebbb4)
Figure 3 EC2 Horizontal Scaling Effect on RPS

![Redis CPU during spike testing](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/c6659d3c-469c-4b58-8e83-fb7ad7bab6e5)
Figure 4 CPU utilization of Redis during spike testing.

### Waitlist Architecture

As illustrated in the diagram, this is the architecture of the waitlist system. Following a successful waitlisting, the server updates the number queue in real-time using Socket.IO.

![waitlist architecture](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/fdbffd30-ce49-4059-a8a1-d4510154f3bb)
Figure 5 Waitlist Architecture
<br>

## Database Schema

![outline_database_schema](https://github.com/HTWu666/Restaurant-Reservation-System-Outline/assets/126232123/d9d05197-b75f-4ae5-b451-1a6fe462b314)
Figure 6 Database Schema

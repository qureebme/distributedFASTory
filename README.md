# distributedFASTory
distributed design on the FASTory line

This task is an assignment for Distributed Automation System Design course.

The FASTory simulator is also online at escop.rd.tut.fi:3000/fmw with a
description of its API.

This task was done with a local simulator running on TCP port 3000. 
Their REST API is similar to that of the real assembly line, 
which is located in Tampere University of Technology's Factory Automation 
Systems and Technologies (FAST) laboratory. (www.tut.fi/fast)

The system is made up of an array of 12 stations, connected in a closed loop.
Each station has a robot and conveyor sections by which products are transferred
between stations.

In the simulator, a product is a drawing of a mobile phone, which consists of three
parts: a screen, a keyboard, and a frame, and there are 3 different types of each,
in 3 different colors, for a total of 729 unique products.

Because no single station can make all the products, pallets (fed from station 7)
carrying paper (fed to pallets when they arrive at station 1) move through the
production line, completing each part of a product as they arrive at the stations.
Drawing is done when a loaded pallet arrives at a free station with capability for
desired product requirement, otherwise it either joins a queue or move on till it 
arrives a station with needed requirement(s). In this way, each pallets is able to 
move freely without hindering others.

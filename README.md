### The useless counter

**Uselesscounter** is a simple P2P and decentralized counter.

There is no central server, it's only P2P, and you can see the total clicks

---

## Who needs this?

Everyone needs something that just display a number!
(no)

## ? How it works

Using hyperswarm.
Your server is joinning a topic and saying it exists.
It find other friends, and then talk to each other
Simple.. right?

There is no memory btw, if everyone stop running this shi- then we restart from zero

## ? How to install??!/1w1!!

### Docker

```bash
docker run -d \
  --name uselesscounter \
  --network host \
  --restart unless-stopped \
  -e PORT=4729\
  ghcr.io/buage/uselesscounter:latest

```

### FAQ

**Q: Does it works?**
A: ofc bro

**Q: Is it synced??!1!!!**
A: probably (not sure cause there is no central storage / server

**Q: do i want it>????**
A: of course you want it.. right?

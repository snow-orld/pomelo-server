CC = gcc
CFLAGS = -lpthread -lm -ggdb

LIB = libpomelo2.a

OBJECT = unit

all: ${OBJECT}

$(OBJECT):
	$(CC) -o $(OBJECT) unit_connect.c $(LIB) $(CFLAGS)

PHONY: clean

clean:
	-rm $(OBJECT)

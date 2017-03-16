/*****************************************************************
 * Unit test for pomelo server.
 *
 * Only test concurrent connections. 
 * Clients do nothing after requesting to noAuthEntryHandler.entry
 *
 * Created on:	3/16/17
 * Created by:	Xueman M.
 * Modified on:	3/16/17
 *
 *****************************************************************/

#include <stdio.h>
#include <string.h>
#include <netinet/in.h>

#include "libpomelo2/include/pomelo.h"

#define PORT 3014
#define HOST "192.168.239.140"

int str2int(char *s) {

	int len = strlen(s);
	int i = 0, result = 0;
	
	for (i = 0; i < len; i++) {
		result = result * 10 + s[i] - '0';
	}
	
	return result;
}

void create_connection() {
	
	pc_client_t *client = (pc_client_t *)malloc(sizeof(pc_client_t));

	// initialize client
	if (pc_client_init(client, NULL, NULL)) {
		printf("failt to initialize client.\n");
		return;
	}
	
	if (pc_client_connect(client, HOST, PORT, NULL)) {
		printf("fail to connect to server.\n");
		pc_client_destroy(client);
		return;
	}
	
}

int main(int argc, char **argv) {
	
	if (argc != 2) {
		printf("usage: ./unit_connect <concurrency>\n");
		return 1;
	}
	
	int N = str2int(argv[1]);

	create_connection();
}

export const POSTMAN_COLLECTION = {
	"info": {
		"_postman_id": "d8395a17-da99-40bb-9f5c-333b8d1d0049",
		"name": "Evolution API | v2.3.*",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "Instance",
			"item": [
				{
					"name": "Create Instance",
					"request": {
						"method": "POST",
						"url": { "raw": "{{baseUrl}}/instance/create" },
						"body": {
							"mode": "raw",
							"raw": "{\n    \"instanceName\": \"{{instance}}\",\n    \"qrcode\": true,\n    \"integration\": \"WHATSAPP-BAILEYS\"\n}"
						}
					}
				},
				{
					"name": "Fetch Instances",
					"request": {
						"method": "GET",
						"url": { "raw": "{{baseUrl}}/instance/fetchInstances" }
					}
				},
				{
					"name": "Instance Connect",
					"request": {
						"method": "GET",
						"url": { "raw": "{{baseUrl}}/instance/connect/{{instance}}" }
					}
				},
				{
					"name": "Restart Instance",
					"request": {
						"method": "POST",
						"url": { "raw": "{{baseUrl}}/instance/restart/{{instance}}" }
					}
				},
				{
					"name": "Set Presence",
					"request": {
						"method": "POST",
						"body": {
							"mode": "raw",
							"raw": "{\n    \"presence\": \"available\"\n}"
						},
						"url": { "raw": "{{baseUrl}}/instance/setPresence/{{instance}}" }
					}
				},
				{
					"name": "Connection Status",
					"request": {
						"method": "GET",
						"url": { "raw": "{{baseUrl}}/instance/connectionState/{{instance}}" }
					}
				},
				{
					"name": "Logout Instance",
					"request": {
						"method": "DELETE",
						"url": { "raw": "{{baseUrl}}/instance/logout/{{instance}}" }
					}
				},
				{
					"name": "Delete Instance",
					"request": {
						"method": "DELETE",
						"url": { "raw": "{{baseUrl}}/instance/delete/{{instance}}" }
					}
				}
			]
		},
		{
			"name": "Send Message",
			"item": [
				{
					"name": "Send Text",
					"request": {
						"method": "POST",
						"body": {
							"mode": "raw",
							"raw": "{\n    \"number\": \"{{remoteJid}}\",\n    \"text\": \"teste de envio\"\n}"
						},
						"url": { "raw": "{{baseUrl}}/message/sendText/{{instance}}" }
					}
				},
				{
					"name": "Send Media URL",
					"request": {
						"method": "POST",
						"body": {
							"mode": "raw",
							"raw": "{\n    \"number\": \"{{remoteJid}}\",\n    \"mediatype\": \"image\",\n    \"mimetype\": \"image/png\",\n    \"caption\": \"Teste de caption\",\n    \"media\": \"https://evolution-api.com/files/evolution-api-favicon.png\",\n    \"fileName\": \"Imagem.png\"\n}"
						},
						"url": { "raw": "{{baseUrl}}/message/sendMedia/{{instance}}" }
					}
				},
				{
					"name": "Send PTV (Video Note)",
					"request": {
						"method": "POST",
						"body": {
							"mode": "raw",
							"raw": "{\n    \"number\": \"{{remoteJid}}\",\n    \"video\": \"https://evolution-api.com/files/video.mp4\"\n}"
						},
						"url": { "raw": "{{baseUrl}}/message/sendPtv/{{instance}}" }
					}
				},
				{
					"name": "Send Audio",
					"request": {
						"method": "POST",
						"body": {
							"mode": "raw",
							"raw": "{\n    \"number\": \"{{remoteJid}}\",\n    \"audio\": \"https://evolution-api.com/files/narratedaudio.mp3\"\n}"
						},
						"url": { "raw": "{{baseUrl}}/message/sendWhatsAppAudio/{{instance}}" }
					}
				},
                {
					"name": "Send Location",
					"request": {
						"method": "POST",
						"body": {
							"mode": "raw",
							"raw": "{\n    \"number\": \"{{remoteJid}}\",\n    \"name\": \"Bora Bora\",\n    \"address\": \"French Polynesian\",\n    \"latitude\": -16.5055,\n    \"longitude\": -151.7422\n}"
						},
						"url": { "raw": "{{baseUrl}}/message/sendLocation/{{instance}}" }
					}
				},
                {
					"name": "Send Poll",
					"request": {
						"method": "POST",
						"body": {
							"mode": "raw",
							"raw": "{\n    \"number\": \"{{remoteJid}}\",\n    \"name\": \"Evolution API is cool?\",\n    \"selectableCount\": 1,\n    \"values\": [\n        \"Yes\",\n        \"Of course\"\n    ]\n}"
						},
						"url": { "raw": "{{baseUrl}}/message/sendPoll/{{instance}}" }
					}
				}
			]
		},
        {
            "name": "Group",
            "item": [
                {
                    "name": "Fetch All Groups",
                    "request": {
                        "method": "GET",
                        "url": { "raw": "{{baseUrl}}/group/fetchAllGroups/{{instance}}?getParticipants=false" }
                    }
                },
                {
                    "name": "Create Group",
                    "request": {
                        "method": "POST",
                        "body": {
                            "mode": "raw",
                            "raw": "{\n  \"subject\": \"Test Group\",\n  \"participants\": [\"{{remoteJid}}\"]\n}"
                        },
                        "url": { "raw": "{{baseUrl}}/group/create/{{instance}}" }
                    }
                },
                {
                    "name": "Find Participants",
                    "request": {
                        "method": "GET",
                        "url": { "raw": "{{baseUrl}}/group/participants/{{instance}}?groupJid={{groupJid}}" }
                    }
                }
            ]
        },
        {
            "name": "Chat",
            "item": [
                 {
                    "name": "Find Chats",
                    "request": {
                        "method": "POST",
                        "body": { "mode": "raw", "raw": "{}" },
                        "url": { "raw": "{{baseUrl}}/chat/findChats/{{instance}}" }
                    }
                },
                {
                    "name": "Check Number",
                    "request": {
                        "method": "POST",
                        "body": {
                            "mode": "raw",
                            "raw": "{\n  \"numbers\": [\"{{remoteJid}}\"]\n}"
                        },
                        "url": { "raw": "{{baseUrl}}/chat/whatsappNumbers/{{instance}}" }
                    }
                },
                {
                     "name": "Fetch Profile Picture",
                     "request": {
                         "method": "POST",
                         "body": {
                             "mode": "raw",
                             "raw": "{\n  \"number\": \"{{remoteJid}}\"\n}"
                         },
                         "url": { "raw": "{{baseUrl}}/chat/fetchProfilePictureUrl/{{instance}}" }
                     }
                }
            ]
        },
        {
            "name": "Integrations",
            "item": [
                {
                    "name": "Set Webhook",
                    "request": {
                        "method": "POST",
                         "body": {
                             "mode": "raw",
                             "raw": "{\n    \"webhook\": {\n        \"enabled\": true,\n        \"url\": \"https://webhook.site/uuid\",\n        \"byEvents\": false,\n        \"events\": [\"MESSAGES_UPSERT\"]\n    }\n}"
                         },
                         "url": { "raw": "{{baseUrl}}/webhook/set/{{instance}}" }
                    }
                },
                {
                    "name": "Set Typebot",
                    "request": {
                        "method": "POST",
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"enabled\": true,\n    \"url\": \"https://typebot.io\",\n    \"typebot\": \"my-bot\",\n    \"triggerType\": \"keyword\",\n    \"triggerValue\": \"hello\"\n}"
                        },
                        "url": { "raw": "{{baseUrl}}/typebot/create/{{instance}}" }
                    }
                }
            ]
        },
        {
            "name": "Label",
            "item": [
                {
                    "name": "Find Labels",
                    "request": {
                        "method": "GET",
                        "url": { "raw": "{{baseUrl}}/label/findLabels/{{instance}}" }
                    }
                }
            ]
        },
        {
            "name": "Settings",
            "item": [
                {
                    "name": "Find Settings",
                    "request": {
                        "method": "GET",
                        "url": { "raw": "{{baseUrl}}/settings/find/{{instance}}" }
                    }
                },
                {
                    "name": "Set Settings",
                    "request": {
                        "method": "POST",
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"rejectCall\": false,\n    \"alwaysOnline\": true,\n    \"readMessages\": false\n}"
                        },
                        "url": { "raw": "{{baseUrl}}/settings/set/{{instance}}" }
                    }
                }
            ]
        }
	]
};
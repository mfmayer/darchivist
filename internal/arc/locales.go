package arc

import (
	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"golang.org/x/text/message/catalog"
)

var localizedMessages = map[string]map[string]interface{}{
	"Renaming %s to %s failed": {
		"de": "Umbenennen von %s nach %s fehlgeschlagen",
	},
	"%s not found": {
		"de": "%s nicht gefunden",
	},
	"%s already exists": {
		"de": "%s existiert bereits",
	},
}

func init() {
	for key, lm := range localizedMessages {
		message.SetString(language.English, key, key)
		for lt, m := range lm {
			tag := language.MustParse(lt)
			switch msg := m.(type) {
			case string:
				message.SetString(tag, key, msg)
			case catalog.Message:
				message.Set(tag, key, msg)
			case []catalog.Message:
				message.Set(tag, key, msg...)
			}
		}
	}
}

package info

import (
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/modifier"
)

// THESE MODIFIERS SHOULD EVENTUALLY BE DEPRECATED

type Status struct {
	modifier.Base
}
type ResistMod struct {
	Ele   attributes.Element
	Value float64
	modifier.Base
}

type DefMod struct {
	Value float64
	Dur   int
	modifier.Base
}

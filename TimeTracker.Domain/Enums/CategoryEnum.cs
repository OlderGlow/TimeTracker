using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TimeTracker.Domain.Enums
{
    public enum CategoryEnum
    {
        [Description("Réunion")]
        Reunion,
        [Description("Daily Scrum")]
        Ds,
        [Description("Gestion de projet")]
        GestionProjet,
        [Description("Autre")]
        Autre,
        [Description("Livraison")]
        Livraison,
        [Description("Pause")]
        Pause,
        [Description("Ticket")]
        Ticket
    }
}

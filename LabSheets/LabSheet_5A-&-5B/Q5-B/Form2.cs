using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace LabSheet5_QB_1303_
{
    public partial class Form2 : Form
    {
        public Form2(string name, string username, string email)
        {
            InitializeComponent();

            lblName.Text = name;
            lblUserName.Text = username;
            lblEmail.Text = email;

        }

        private void label1_Click(object sender, EventArgs e)
        {

        }
    }
}

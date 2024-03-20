using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Forms;

namespace LabSheet5_QB_1303_
{
    public partial class Form1 : Form
    {
        
        public Form1()
        {
            InitializeComponent();
        }

        private void textBox4_TextChanged(object sender, EventArgs e)
        {

        }

        private void label5_Click(object sender, EventArgs e)
        {

        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void btnSubmit_Click(object sender, EventArgs e)
        {
            if (txtPassWord.Text != txtConPassWord.Text)
            {
                MessageBox.Show("Password is not match!");

            }
            if (string.IsNullOrWhiteSpace(txtFName.Text) || string.IsNullOrWhiteSpace(txtFName.Text) || string.IsNullOrWhiteSpace(txtEmail.Text)
                || string.IsNullOrWhiteSpace(txtUserName.Text) || string.IsNullOrWhiteSpace(txtPassWord.Text) || string.IsNullOrWhiteSpace(txtConPassWord.Text) 
                || string.IsNullOrWhiteSpace(txtDOB.Text))
            {
                MessageBox.Show("Empty field");
            }
            if (!IsString(txtFName.Text) || !IsString(txtFName.Text) || !IsString(txtEmail.Text)
                || !IsString(txtUserName.Text))
            {
                MessageBox.Show("Enter Valid Letter");
            }
            if (IsSignUpValid())
            {
                string name = txtFName.Text + " " + txtLName.Text;
                string username = txtUserName.Text;
                string email = txtEmail.Text;

                Form2 form2 = new Form2(name, username, email);
                this.Hide();
                form2.Show();

            }
            else
            {
                MessageBox.Show("Please check your inputs.");
            }

       


           
            
        }
        private bool IsSignUpValid()
        {
            throw new NotImplementedException();
            
        }

        private bool IsString(string text)
        {
            return text.All(char.IsLetter);
        }

        private void butReset_Click(object sender, EventArgs e)
        {
            txtFName.Clear();
            txtLName.Clear();
            txtUserName.Clear();
            txtPassWord.Clear();
            txtConPassWord.Clear();
            txtEmail.Clear();

        }
    }
}

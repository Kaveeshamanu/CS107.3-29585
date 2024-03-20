using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Lab_Session5_1303_windowsForm
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void butCalculate_Click(object sender, EventArgs e)
        {
            int num1 = int.Parse(txtNum1.Text);
            int num2 = int.Parse(txtNum2.Text);

            txtAnswerExe.Text = (num1 + num2).ToString();
            
            
            

        }

        private void butClear_Click(object sender, EventArgs e)
        {
            txtNum1.Text = " ";
            txtNum2.Text = " ";
            txtAnswerExe.Text = " ";
        }

        private void txtAnswerExe_TextChanged(object sender, EventArgs e)
        {

        }

        private void butSubtraction_Click(object sender, EventArgs e)
        {
            int num1 = int.Parse(txtNum1.Text);
            int num2 = int.Parse(txtNum2.Text);

            txtAnswerExe.Text = (num1 - num2).ToString();

        }

        private void butDivision_Click(object sender, EventArgs e)
        {
            int num1 = int.Parse(txtNum1.Text);
            int num2 = int.Parse(txtNum2.Text);

            txtAnswerExe.Text = (num1 / num2).ToString();

        }

        private void butMultiplication_Click(object sender, EventArgs e)
        {
            int num1 = int.Parse(txtNum1.Text);
            int num2 = int.Parse(txtNum2.Text);

            txtAnswerExe.Text = (num1 * num2).ToString();

        }
    }
}
